
import type { ApiVersion, ApiVersionStatus } from '../../types/version.types'
import './ApiVersionsTable.css'

interface ApiVersionsTableProps {
  versions: ApiVersion[]
  documentCounts: Record<string, number>
  onUploadDocument: (version: ApiVersion) => void
  onViewDocuments: (version: ApiVersion) => void
}

const statusLabels: Record<ApiVersionStatus, string> = {
  DRAFT: 'Borrador',
  ACTIVE: 'Activa',
  DEPRECATED: 'Deprecada',
}

function compareVersions(a: ApiVersion, b: ApiVersion) {
  const aParts = a.version.split('.').map(Number)
  const bParts = b.version.split('.').map(Number)

  for (let index = 0; index < 3; index++) {
    const difference = bParts[index] - aParts[index]

    if (difference !== 0) return difference
  }

  return 0
}

export function ApiVersionsTable({
  versions,
  onUploadDocument,
  documentCounts,
  onViewDocuments,
}: ApiVersionsTableProps) {
  const sortedVersions = [...versions].sort(compareVersions)

  if (sortedVersions.length === 0) {
    return (
      <div className="api-versions__empty">
        <strong>No hay versiones registradas</strong>
        <p>
          Registra la primera versión para comenzar a
          administrar los contratos de esta API.
        </p>
      </div>
    )
  }

  return (
    <div className="api-versions__scroll">
      <table className="api-versions__table">
        <thead>
          <tr>
            <th>Versión</th>
            <th>Descripción</th>
            <th>Estado</th>
            <th>OpenAPI</th>
            <th>Actualización</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {sortedVersions.map((version) => (
            <tr key={version.id}>
              <td>
                <span className="api-versions__number">v{version.version}</span>
              </td>

              <td>{version.description || "Sin descripción"}</td>

              <td>
                <span
                  className={`api-versions__status api-versions__status--${version.status.toLowerCase()}`}
                >
                  {statusLabels[version.status]}
                </span>
              </td>

              <td>
                <span className="api-versions__document-count">
                  {documentCounts[version.id] ?? 0} documento(s)
                </span>
              </td>

              <td>
                {new Date(version.updatedAt).toLocaleDateString("es-CL", {
                  timeZone: "UTC",
                })}
              </td>

              <td>
                <div className="api-versions__actions">
                  {(documentCounts[version.id] ?? 0) > 0 && (
                    <button
                      type="button"
                      className="api-versions__view-button"
                      onClick={() => onViewDocuments(version)}
                    >
                      Ver documentos
                    </button>
                  )}

                  <button
                    type="button"
                    className="api-versions__upload-button"
                    onClick={() => onUploadDocument(version)}
                  >
                    Cargar OpenAPI
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
