import { useCallback, useEffect, useMemo, useState } from "react";

import { Link } from "react-router-dom";

import { ClipboardCheck, RefreshCw, Search } from "lucide-react";

import { Card } from "../../../components/ui/Card/Card";

import { useAuth } from "../../auth/context/AuthContext";

import { WorkflowModal } from "../../workflow/components/WorkflowModal/WorkflowModal";

import { workflowStatusLabels } from "../../workflow/types/workflow.types";

import type { ApiVersion } from "../../versions/types/version.types";

import { fetchReviewQueue } from "../services/reviews.api";

import type {
  ReviewQueueItem,
  ReviewQueueResponse,
  ReviewQueueStatus,
} from "../types/review.types";

import "./ReviewPage.css";

type StatusFilter = ReviewQueueStatus | "ALL";

const statusOptions: ReviewQueueStatus[] = [
  "IN_REVIEW",
  "OBSERVED",
  "CORRECTED",
  "APPROVED",
];

function formatDate(value: string): string {
  return new Date(value).toLocaleString("es-CL", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function getReviewDecision(item: ReviewQueueItem): string {
  switch (item.workflowStatus) {
    case "IN_REVIEW":
      return item.evaluationReady
        ? "Lista para decisión del revisor"
        : "Requiere observaciones o correcciones";

    case "OBSERVED":
      return "Pendiente de corrección";

    case "CORRECTED":
      return "Pendiente de nueva revisión";

    case "APPROVED":
      return "Pendiente de publicación";
  }
}

function toApiVersion(item: ReviewQueueItem): ApiVersion {
  return {
    id: item.id,
    apiId: item.apiId,
    version: item.version,
    description: item.description,
    status: item.lifecycleStatus,
    workflowStatus: item.workflowStatus,
    createdAt: item.updatedAt,
    updatedAt: item.updatedAt,
  };
}

export function ReviewPage() {
  const { user } = useAuth();

  const [queue, setQueue] = useState<ReviewQueueResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const [selectedVersion, setSelectedVersion] = useState<ApiVersion | null>(
    null,
  );

  const loadQueue = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchReviewQueue();
      setQueue(response);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "No fue posible consultar la bandeja.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadQueue();
  }, [loadQueue]);

  const items = queue?.items ?? [];

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();

    return items.filter((item) => {
      const matchesSearch = [
        item.api.name,
        item.api.owner,
        item.version,
        item.description,
        item.document?.fileName ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(term);

      const matchesStatus =
        statusFilter === "ALL" || item.workflowStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [items, search, statusFilter]);

  const canManage = (status: ReviewQueueStatus) => {
    const roles = user?.roles ?? [];

    if (roles.includes("ADMIN")) return true;

    if (status === "IN_REVIEW") {
      return roles.includes("REVIEWER");
    }

    if (status === "OBSERVED" || status === "CORRECTED") {
      return roles.includes("DEVELOPER");
    }

    return false;
  };

  return (
    <div className="review-page">
      <header className="review-page__header">
        <div>
          <h1>Bandeja de revisión</h1>
          <p>
            Gestiona las versiones que requieren revisión, corrección,
            aprobación o publicación.
          </p>
        </div>

        <button
          type="button"
          className="review-page__refresh"
          onClick={() => void loadQueue()}
          disabled={loading}
        >
          <RefreshCw size={16} />
          Actualizar
        </button>
      </header>

      <section
        className="review-page__metrics"
        aria-label="Resumen del workflow"
      >
        <Card className="review-page__metric">
          <span>En revisión</span>
          <strong>{queue?.summary.inReview ?? 0}</strong>
        </Card>

        <Card className="review-page__metric">
          <span>Observadas</span>
          <strong>{queue?.summary.observed ?? 0}</strong>
        </Card>

        <Card className="review-page__metric">
          <span>Corregidas</span>
          <strong>{queue?.summary.corrected ?? 0}</strong>
        </Card>

        <Card className="review-page__metric">
          <span>Aprobadas</span>
          <strong>{queue?.summary.approved ?? 0}</strong>
        </Card>
      </section>

      <Card className="review-page__catalog">
        <div className="review-page__catalog-header">
          <div>
            <h2>Solicitudes y seguimiento</h2>
            <p>Información obtenida del workflow registrado en PostgreSQL.</p>
          </div>

          <span>{filteredItems.length} versiones</span>
        </div>

        <div className="review-page__filters">
          <label className="review-page__search">
            <Search size={17} />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar API, versión o responsable..."
              aria-label="Buscar revisiones"
            />
          </label>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as StatusFilter)
            }
            aria-label="Filtrar por estado de revisión"
          >
            <option value="ALL">Todos los estados</option>

            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {workflowStatusLabels[status]}
              </option>
            ))}
          </select>
        </div>

        {loading && (
          <p role="status" className="review-page__message">
            Cargando solicitudes de revisión...
          </p>
        )}

        {error && (
          <p role="alert" className="review-page__error">
            {error}
          </p>
        )}

        {!loading && !error && filteredItems.length === 0 && (
          <div className="review-page__empty">
            <ClipboardCheck size={26} />
            <strong>No hay solicitudes para mostrar</strong>
            <p>
              No existen versiones que coincidan con los filtros seleccionados.
            </p>
          </div>
        )}

        {!loading && !error && filteredItems.length > 0 && (
          <div className="review-page__table-scroll">
            <table className="review-page__table">
              <thead>
                <tr>
                  <th>API / Versión</th>
                  <th>Estado</th>
                  <th>Quality Score</th>
                  <th>Evaluación</th>
                  <th>Decisión</th>
                  <th>Actualización</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="review-page__api">
                        <strong>{item.api.name}</strong>
                        <small>
                          v{item.version}
                          {" · "}
                          {item.api.owner}
                        </small>
                      </div>
                    </td>

                    <td>
                      <span
                        className={
                          `review-page__status ` +
                          `review-page__status--` +
                          item.workflowStatus.toLowerCase()
                        }
                      >
                        {workflowStatusLabels[item.workflowStatus]}
                      </span>
                    </td>

                    <td>
                      {item.evaluation?.status === "COMPLETED" &&
                      item.evaluation.qualityScore !== null
                        ? `${item.evaluation.qualityScore.toLocaleString(
                            "es-CL",
                          )}/100`
                        : "—"}
                    </td>

                    <td>
                      <span
                        className={
                          item.evaluationReady
                            ? "review-page__ready"
                            : "review-page__not-ready"
                        }
                      >
                        {item.evaluationReady
                          ? "Apta para aprobación"
                          : "No apta / pendiente"}
                      </span>
                    </td>

                    <td>
                      <span className="review-page__decision">
                        {getReviewDecision(item)}
                      </span>

                      {item.workflowStatus === "IN_REVIEW" &&
                        item.approvalBlockers.length > 0 && (
                          <details className="review-page__blockers">
                            <summary>
                              Ver {item.approvalBlockers.length} condición(es)
                              pendientes
                            </summary>

                            <ul>
                              {item.approvalBlockers.map((reason, index) => (
                                <li key={`${item.id}-${index}`}>{reason}</li>
                              ))}
                            </ul>

                            {(item.evaluation?.blockingRules ?? []).map(
                              (rule) => (
                                <div
                                  key={rule.id}
                                  className="review-page__blocking-rule"
                                >
                                  <strong>
                                    {rule.ruleId}
                                    {rule.ruleName ? ` — ${rule.ruleName}` : ""}
                                  </strong>

                                  <p>{rule.message}</p>

                                  {rule.recommendation && (
                                    <p>Recomendación: {rule.recommendation}</p>
                                  )}
                                </div>
                              ),
                            )}
                          </details>
                        )}
                    </td>

                    <td>{formatDate(item.updatedAt)}</td>

                    <td>
                      <div className="review-page__actions">
                        <Link to={`/app/apis/${item.apiId}`}>Ver API</Link>

                        {item.evaluation && (
                          <Link
                            to={
                              `/app/evaluations/` +
                              encodeURIComponent(item.evaluation.id)
                            }
                          >
                            Evaluación
                          </Link>
                        )}

                        {canManage(item.workflowStatus) && (
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedVersion(toApiVersion(item))
                            }
                          >
                            Gestionar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {selectedVersion && (
        <WorkflowModal
          version={selectedVersion}
          onClose={() => {
            setSelectedVersion(null);
            void loadQueue();
          }}
          onUpdated={loadQueue}
        />
      )}
    </div>
  );
}
