import { ApiContext } from "./ApiContext";
import { useCallback, useEffect, useState, type ReactNode } from "react";

import { fetchApis, createApiRequest } from "../services/apis.api";

import type { Api } from "../types/api.types";
import type { CreateApiData } from "../components/CreateApiModal/CreateApiModal";

import type {
  GovernanceExecution,
  RuleResult,
  CreateEvaluationData,
} from "../../evaluations/types/evaluation.types";

import {
  fetchVersionsByApiId,
  createVersionRequest,
} from "../../versions/services/versions.api";

import type {
  ApiVersion,
  CreateApiVersionData,
} from "../../versions/types/version.types";

import type {
  OpenApiDocument,
  CreateOpenApiDocumentData,
} from "../../openapi/types/openapi.types";

import {
  createDocumentRequest,
  fetchDocumentsByVersionId,
} from "../../openapi/services/documents.api";

import {
  createEvaluationRequest,
  executeEvaluationRequest,
} from "../../evaluations/services/evaluations.api";

interface ApiProviderProps {
  children: ReactNode;
}

export function ApiProvider({ children }: ApiProviderProps) {
  const [apis, setApis] = useState<Api[]>([]);
  const [isLoadingApis, setIsLoadingApis] = useState(true);
  const [apisError, setApisError] = useState<string | null>(null);
  const [versions, setVersions] = useState<ApiVersion[]>([]);

  const [isLoadingVersions, setIsLoadingVersions] = useState(false);

  const [versionsError, setVersionsError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<OpenApiDocument[]>([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);

  const [documentsError, setDocumentsError] = useState<string | null>(null);

  const [evaluations, setEvaluations] = useState<GovernanceExecution[]>([]);
  const [ruleResults] = useState<RuleResult[]>([]);

  const refreshApis = useCallback(async (): Promise<void> => {
    setIsLoadingApis(true);
    setApisError(null);

    try {
      const backendApis = await fetchApis();
      setApis(backendApis);
    } catch {
      setApisError("No fue posible cargar las APIs desde el servidor.");
    } finally {
      setIsLoadingApis(false);
    }
  }, []);

  useEffect(() => {
    void refreshApis();
  }, [refreshApis]);

  async function createApi(data: CreateApiData): Promise<boolean> {
    const name = data.name.trim();

    const exists = apis.some(
      (api) => api.name.trim().toLowerCase() === name.toLowerCase(),
    );

    if (exists) {
      return false;
    }

    const createdApi = await createApiRequest({
      name,
      description: data.description.trim(),
      owner: data.owner.trim(),
    });

    setApis((current) => [createdApi, ...current]);

    return true;
  }

  function getApiById(id: string): Api | undefined {
    return apis.find((api) => api.id === id);
  }

  async function loadVersionsByApiId(apiId: string): Promise<void> {
    setIsLoadingVersions(true);
    setIsLoadingDocuments(true);
    setVersionsError(null);
    setDocumentsError(null);

    try {
      const backendVersions = await fetchVersionsByApiId(apiId);

      const documentLists = await Promise.all(
        backendVersions.map((version) => fetchDocumentsByVersionId(version.id)),
      );

      const backendDocuments = documentLists.flat();

      const versionIds = new Set(backendVersions.map((version) => version.id));

      setVersions((current) => [
        ...current.filter((version) => version.apiId !== apiId),
        ...backendVersions,
      ]);

      setDocuments((current) => [
        ...current.filter((document) => !versionIds.has(document.versionId)),
        ...backendDocuments.map((document) => ({
          ...document,
          content: "",
        })),
      ]);
    } catch {
      setVersionsError(
        "No fue posible cargar las versiones y documentos desde PostgreSQL.",
      );
      setDocumentsError("No fue posible recuperar los documentos OpenAPI.");
    } finally {
      setIsLoadingVersions(false);
      setIsLoadingDocuments(false);
    }
  }

  function getVersionsByApiId(apiId: string): ApiVersion[] {
    return versions.filter((item) => item.apiId === apiId);
  }

  async function createVersion(data: CreateApiVersionData): Promise<boolean> {
    const apiExists = apis.some((api) => api.id === data.apiId);

    if (!apiExists) {
      return false;
    }

    const normalizedVersion = data.version.trim();

    if (!/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(normalizedVersion)) {
      return false;
    }

    const versionExists = versions.some(
      (version) =>
        version.apiId === data.apiId && version.version === normalizedVersion,
    );

    if (versionExists) {
      return false;
    }

    const createdVersion = await createVersionRequest({
      ...data,
      version: normalizedVersion,
      description: data.description.trim(),
    });

    setVersions((current) => [...current, createdVersion]);

    await refreshApis();

    return true;
  }

  function getDocumentsByVersionId(versionId: string): OpenApiDocument[] {
    return documents.filter((document) => document.versionId === versionId);
  }

  async function createDocument(
    data: CreateOpenApiDocumentData,
  ): Promise<boolean> {
    const versionExists = versions.some(
      (version) => version.id === data.versionId,
    );

    if (!versionExists) {
      return false;
    }

    const createdDocument = await createDocumentRequest({
      versionId: data.versionId,
      fileName: data.fileName.trim(),
      content: data.content,
      format: data.format,
    });

    setDocuments((current) => [...current, createdDocument]);

    return true;
  }

  function getEvaluationsByDocumentId(
    documentId: string,
  ): GovernanceExecution[] {
    return evaluations.filter(
      (evaluation) => evaluation.documentId === documentId,
    );
  }

  async function requestEvaluation(
    data: CreateEvaluationData,
  ): Promise<string> {
    // NestJS comprueba que el documento exista y registra
    // una evaluación real en estado PENDING.
    const createdEvaluation = await createEvaluationRequest(data.documentId);

    // Conservamos el registro real en el contexto para
    // mantener compatibilidad con otros consumidores.
    setEvaluations((current) => [
      createdEvaluation,
      ...current.filter((item) => item.id !== createdEvaluation.id),
    ]);

    try {
      // El backend cambia el estado a RUNNING,
      // ejecuta las reglas y persiste sus resultados.
      const executedEvaluation = await executeEvaluationRequest(
        createdEvaluation.id,
      );

      setEvaluations((current) =>
        current.map((item) =>
          item.id === executedEvaluation.id ? executedEvaluation : item,
        ),
      );
    } catch {
      // La evaluación ya existe en PostgreSQL.
      // Devolvemos su ID para consultar el estado real
      // en la página de detalle, incluso si la ejecución falló.
    }

    return createdEvaluation.id;
  }

  async function loadDocumentsByVersionId(versionId: string): Promise<void> {
    setIsLoadingDocuments(true);
    setDocumentsError(null);

    try {
      const summaries = await fetchDocumentsByVersionId(versionId);

      setDocuments((current) => [
        ...current.filter((document) => document.versionId !== versionId),
        ...summaries.map((document) => ({
          ...document,
          content: "",
        })),
      ]);
    } catch {
      setDocumentsError("No fue posible cargar los documentos OpenAPI.");
    } finally {
      setIsLoadingDocuments(false);
    }
  }

  return (
    <ApiContext.Provider
      value={{
        apis,
        isLoadingApis,
        apisError,
        refreshApis,
        createApi,
        getApiById,

        versions,
        getVersionsByApiId,
        createVersion,
        loadVersionsByApiId,
        isLoadingVersions,
        versionsError,

        documents,
        getDocumentsByVersionId,
        createDocument,
        loadDocumentsByVersionId,
        isLoadingDocuments,
        documentsError,

        evaluations,
        ruleResults,
        getEvaluationsByDocumentId,
        requestEvaluation,
      }}
    >
      {children}
    </ApiContext.Provider>
  );
}
