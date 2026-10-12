import { useState, type ReactNode } from "react";

import { mockApis } from "../../../mocks/apis";
import { ApiContext } from "./ApiContext";

import type { Api } from "../types/api.types";
import type { CreateApiData } from "../components/CreateApiModal/CreateApiModal";

import { mockVersions } from "../../../mocks/versions";

import type {
  ApiVersion,
  CreateApiVersionData,
} from "../../versions/types/version.types";

import type {
  OpenApiDocument,
  CreateOpenApiDocumentData,
} from "../../openapi/types/openapi.types";

interface ApiProviderProps {
  children: ReactNode;
}

export function ApiProvider({ children }: ApiProviderProps) {
  const [apis, setApis] = useState<Api[]>(() => [...mockApis]);
  const [versions, setVersions] = useState<ApiVersion[]>(() => [
    ...mockVersions,
  ]);
  const [documents, setDocuments] = useState<OpenApiDocument[]>([]);

  function createApi(data: CreateApiData): boolean {
    const exists = apis.some(
      (api) => api.name.trim().toLowerCase() === data.name.trim().toLowerCase(),
    );

    if (exists) {
      return false;
    }

    const newApi: Api = {
      id: crypto.randomUUID(),
      name: data.name.trim(),
      description: data.description.trim(),
      owner: data.owner.trim(),
      status: "DRAFT",
      latestVersion: "—",
      versionCount: 0,
      updatedAt: new Date().toISOString().slice(0, 10),
    };

    setApis((current) => [newApi, ...current]);

    return true;
  }

  function getApiById(id: string): Api | undefined {
    return apis.find((api) => api.id === id);
  }

  function getVersionsByApiId(apiId: string): ApiVersion[] {
    return versions.filter((item) => item.apiId === apiId);
  }

  function createVersion(data: CreateApiVersionData): boolean {
    const apiExists = apis.some((api) => api.id === data.apiId);

    if (!apiExists) {
      return false;
    }

    const normalizedVersion = data.version.trim();

    if (!/^\d+\.\d+\.\d+$/.test(normalizedVersion)) {
      return false;
    }

    const versionExists = versions.some(
      (item) => item.apiId === data.apiId && item.version === normalizedVersion,
    );

    if (versionExists) {
      return false;
    }

    const now = new Date().toISOString();

    const newVersion: ApiVersion = {
      id: crypto.randomUUID(),
      apiId: data.apiId,
      version: normalizedVersion,
      description: data.description.trim(),
      status: "DRAFT",
      createdAt: now,
      updatedAt: now,
    };

    setVersions((current) => [...current, newVersion]);

    return true;
  }

  function getDocumentsByVersionId(versionId: string): OpenApiDocument[] {
    return documents.filter((document) => document.versionId === versionId);
  }

  function createDocument(data: CreateOpenApiDocumentData): boolean {
    // Verificar que la versión exista.
    const versionExists = versions.some(
      (version) => version.id === data.versionId,
    );

    if (!versionExists) {
      return false;
    }

    // Rechazar contenido vacío.
    if (!data.content.trim()) {
      return false;
    }

    // Validar los metadatos básicos.
    if (!data.fileName.trim()) {
      return false;
    }

    if (!["JSON", "YAML"].includes(data.format)) {
      return false;
    }

    // No registrar documentos que todavía no
    // hayan superado la validación estructural.
    if (!data.isValid) {
      return false;
    }

    const newDocument: OpenApiDocument = {
      id: crypto.randomUUID(),
      versionId: data.versionId,
      fileName: data.fileName.trim(),
      content: data.content,
      format: data.format,
      openApiVersion: data.openApiVersion,
      isValid: true,
      uploadedBy: "mock-user",
      createdAt: new Date().toISOString(),
    };

    setDocuments((current) => [...current, newDocument]);

    return true;
  }

  return (
    <ApiContext.Provider
      value={{
        apis,
        createApi,
        getApiById,

        versions,
        getVersionsByApiId,
        createVersion,

        documents,
        getDocumentsByVersionId,
        createDocument,
      }}
    >
      {children}
    </ApiContext.Provider>
  );
}
