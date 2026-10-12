import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Box, CalendarDays, Layers3, UserRound } from "lucide-react";

import { useApis } from "../hooks/useApis";

import { Card } from "../../../components/ui/Card/Card";
import { ApiVersionsTable } from "../../versions/components/ApiVersionsTable/ApiVersionsTable";

import { UploadOpenApiModal } from "../../openapi/components/UploadOpenApiModal/UploadOpenApiModal";
import type { ApiVersion } from "../../versions/types/version.types";

import { OpenApiDocumentsModal } from '../../openapi/components/OpenApiDocumentsModal/OpenApiDocumentsModal'

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "../../../components/ui/Button/Button";

import { CreateVersionModal } from "../../versions/components/CreateVersionModal/CreateVersionModal";
import type { CreateApiVersionData } from "../../versions/types/version.types";

import type { ApiLifecycleStatus } from "../types/api.types";

import "./ApiDetailPage.css";

const statusLabels: Record<ApiLifecycleStatus, string> = {
  ACTIVE: "Activa",
  DRAFT: "Borrador",
  DEPRECATED: "Deprecada",
};

export function ApiDetailPage() {
  const { apiId } = useParams<{ apiId: string }>();
  const { getApiById, getVersionsByApiId, createVersion, createDocument, documents } =
    useApis();

  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [viewingVersion, setViewingVersion] = useState<ApiVersion | null>(null)
  const api = apiId ? getApiById(apiId) : undefined;
  const apiVersions = apiId ? getVersionsByApiId(apiId) : [];

  const [selectedVersion, setSelectedVersion] = useState<ApiVersion | null>(
    null,
  );

  const latestVersion = [...apiVersions].sort((a, b) => {
    const aParts = a.version.split(".").map(Number);
    const bParts = b.version.split(".").map(Number);

    for (let index = 0; index < 3; index++) {
      if (aParts[index] !== bParts[index]) {
        return bParts[index] - aParts[index];
      }
    }

    return 0;
  })[0];

  const documentCounts = documents.reduce<Record<string, number>>(
    (counts, document) => {
      counts[document.versionId] = (counts[document.versionId] ?? 0) + 1;

      return counts;
    },
    {},
  );

  if (!api) {
    return (
      <div className="api-detail-page">
        <Link to="/app/apis" className="api-detail__back">
          <ArrowLeft size={16} />
          Volver al catálogo
        </Link>

        <Card className="api-detail__not-found">
          <h1>API no encontrada</h1>
          <p>No existe una API registrada con el identificador solicitado.</p>
        </Card>
      </div>
    );
  }

  function handleCreateVersion(data: CreateApiVersionData): boolean {
    return createVersion(data);
  }

  return (
    <div className="api-detail-page">
      <Link to="/app/apis" className="api-detail__back">
        <ArrowLeft size={16} />
        Volver al catálogo
      </Link>

      <header className="api-detail__header">
        <div className="api-detail__heading">
          <span className="api-detail__eyebrow">API Workspace</span>

          <h1>{api.name}</h1>

          <p>{api.description}</p>
        </div>

        <span
          className={`api-detail__status api-detail__status--${api.status.toLowerCase()}`}
        >
          {statusLabels[api.status]}
        </span>
      </header>

      <section className="api-detail__metrics" aria-label="Resumen de la API">
        <Card className="api-detail__metric">
          <div className="api-detail__metric-icon">
            <Layers3 size={19} />
          </div>

          <span>Versiones registradas</span>
          <strong>{apiVersions.length}</strong>
        </Card>

        <Card className="api-detail__metric">
          <div className="api-detail__metric-icon">
            <Box size={19} />
          </div>

          <span>Última versión</span>
          <strong>{latestVersion ? `v${latestVersion.version}` : "—"}</strong>
        </Card>
      </section>

      <Card className="api-detail__section">
        <div className="api-detail__section-heading">
          <h2>Información general</h2>
          <p>Datos principales del activo registrado.</p>
        </div>

        <div className="api-detail__information">
          <div className="api-detail__information-item">
            <UserRound size={18} />

            <div>
              <span>Responsable</span>
              <strong>{api.owner}</strong>
            </div>
          </div>

          <div className="api-detail__information-item">
            <CalendarDays size={18} />

            <div>
              <span>Última actualización</span>
              <strong>
                {new Date(`${api.updatedAt}T12:00:00`).toLocaleDateString(
                  "es-CL",
                )}
              </strong>
            </div>
          </div>

          <div className="api-detail__information-item">
            <Layers3 size={18} />

            <div>
              <span>Estado del activo</span>
              <strong>{statusLabels[api.status]}</strong>
            </div>
          </div>
        </div>
      </Card>

      <Card className="api-detail__section">
        <div className="api-detail__versions-header">
          <div className="api-detail__section-heading">
            <h2>Versiones y especificaciones OpenAPI</h2>

            <p>Consulta y administra las versiones registradas de esta API.</p>
          </div>

          <Button onClick={() => setIsVersionModalOpen(true)}>
            <Plus size={17} />
            Nueva versión
          </Button>
        </div>

        <ApiVersionsTable
          versions={apiVersions}
          onUploadDocument={setSelectedVersion}
          documentCounts={documentCounts}
          onViewDocuments={setViewingVersion}
        />
      </Card>

      {isVersionModalOpen && (
        <CreateVersionModal
          apiId={api.id}
          existingVersions={apiVersions.map((version) => version.version)}
          onClose={() => setIsVersionModalOpen(false)}
          onCreate={handleCreateVersion}
        />
      )}

      {selectedVersion && (
        <UploadOpenApiModal
          versionId={selectedVersion.id}
          version={selectedVersion.version}
          onCreate={createDocument}
          onClose={() => setSelectedVersion(null)}
        />
      )}

      {viewingVersion && (
        <OpenApiDocumentsModal
          version={viewingVersion.version}
          documents={documents.filter(
            (document) => document.versionId === viewingVersion.id,
          )}
          onClose={() => setViewingVersion(null)}
        />
      )}
    </div>
  );
}
