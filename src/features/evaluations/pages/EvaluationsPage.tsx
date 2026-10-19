import { useEffect, useMemo, useState } from "react";
import { ClipboardCheck, Search } from "lucide-react";
import { Link } from "react-router-dom";

import { Card } from "../../../components/ui/Card/Card";
import {
  fetchEvaluations,
  type BackendEvaluation,
} from "../services/evaluations.api";

import type { EvaluationStatus } from "../types/evaluation.types";

import "./EvaluationsPage.css";

type StatusFilter = EvaluationStatus | "ALL";

const statusLabels: Record<EvaluationStatus, string> = {
  PENDING: "Pendiente",
  RUNNING: "En ejecución",
  COMPLETED: "Completada",
  FAILED: "Fallida",
};

function formatDate(value: string): string {
  return new Date(value).toLocaleString("es-CL", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export function EvaluationsPage() {
  const [evaluations, setEvaluations] = useState<BackendEvaluation[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    void fetchEvaluations()
      .then((data) => {
        if (active) {
          setEvaluations(data);
          setLoadError(null);
        }
      })
      .catch(() => {
        if (active) {
          setLoadError(
            "No fue posible consultar las evaluaciones desde NestJS.",
          );
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const rows = useMemo(() => {
    return evaluations.map((evaluation) => ({
      evaluation,
      document: evaluation.document,
      version: evaluation.document?.apiVersion,
      api: evaluation.document?.apiVersion.api,
    }));
  }, [evaluations]);

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();

    return rows
      .filter(({ evaluation, document, api }) => {
        const matchesSearch =
          evaluation.id.toLowerCase().includes(term) ||
          (document?.fileName ?? "").toLowerCase().includes(term) ||
          (api?.name ?? "").toLowerCase().includes(term);

        const matchesStatus =
          statusFilter === "ALL" || evaluation.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort(
        (a, b) =>
          new Date(b.evaluation.requestedAt).getTime() -
          new Date(a.evaluation.requestedAt).getTime(),
      );
  }, [rows, search, statusFilter]);

  const completedCount = evaluations.filter(
    (evaluation) => evaluation.status === "COMPLETED",
  ).length;

  const runningCount = evaluations.filter(
    (evaluation) => evaluation.status === "RUNNING",
  ).length;

  return (
    <div className="evaluations-page">
      <header className="evaluations-page__header">
        <h1>Evaluaciones</h1>
        <p>
          Consulta las ejecuciones de gobierno realizadas sobre las
          especificaciones OpenAPI.
        </p>
      </header>

      {isLoading && (
        <p role="status">Cargando evaluaciones desde PostgreSQL...</p>
      )}

      {loadError && <p role="alert">{loadError}</p>}

      <section
        className="evaluations-page__metrics"
        aria-label="Resumen de evaluaciones"
      >
        <Card className="evaluations-page__metric">
          <span>Evaluaciones totales</span>
          <strong>{evaluations.length}</strong>
        </Card>

        <Card className="evaluations-page__metric">
          <span>Completadas</span>
          <strong>{completedCount}</strong>
        </Card>

        <Card className="evaluations-page__metric">
          <span>En ejecución</span>
          <strong>{runningCount}</strong>
        </Card>
      </section>

      <Card className="evaluations-page__catalog">
        <div className="evaluations-page__catalog-header">
          <div>
            <h2>Historial de evaluaciones</h2>
            <p>Resultados asociados a documentos OpenAPI y sus versiones.</p>
          </div>

          <span>{filteredRows.length} resultados</span>
        </div>

        <div className="evaluations-page__filters">
          <label className="evaluations-page__search">
            <Search size={17} />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por API, documento o evaluación..."
              aria-label="Buscar evaluaciones"
            />
          </label>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as StatusFilter)
            }
            aria-label="Filtrar por estado"
          >
            <option value="ALL">Todos los estados</option>

            {(Object.keys(statusLabels) as EvaluationStatus[]).map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>
        </div>

        {!isLoading && !loadError && filteredRows.length === 0 ? (
          <div className="evaluations-page__empty">
            <div className="evaluations-page__empty-icon">
              <ClipboardCheck size={25} />
            </div>

            <strong>
              {evaluations.length === 0
                ? "Todavía no hay evaluaciones"
                : "No se encontraron resultados"}
            </strong>

            <p>
              {evaluations.length === 0
                ? "Cuando ejecutemos las reglas de gobierno sobre un documento OpenAPI, su evaluación aparecerá aquí."
                : "Prueba con otros criterios de búsqueda o estado."}
            </p>
          </div>
        ) : !isLoading && !loadError ?(
          <div className="evaluations-page__table-scroll">
            <table className="evaluations-page__table">
              <thead>
                <tr>
                  <th>API / Documento</th>
                  <th>Versión</th>
                  <th>Estado</th>
                  <th>Quality Score</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {filteredRows.map(({ evaluation, document, version, api }) => (
                  <tr key={evaluation.id}>
                    <td>
                      <div className="evaluations-page__api">
                        <strong>{api?.name ?? "API no disponible"}</strong>
                        <small>
                          {document?.fileName ?? "Documento no disponible"}
                        </small>
                      </div>
                    </td>

                    <td>{version ? `v${version.version}` : "—"}</td>

                    <td>
                      <span
                        className={`evaluations-page__status evaluations-page__status--${evaluation.status.toLowerCase()}`}
                      >
                        {statusLabels[evaluation.status]}
                      </span>
                    </td>

                    <td>
                      {evaluation.scoreAssessment?.score != null
                        ? `${evaluation.scoreAssessment.score}/100 (preliminar)`
                        : evaluation.qualityScore != null
                          ? `${evaluation.qualityScore}/100`
                          : "—"}
                    </td>

                    <td>{formatDate(evaluation.requestedAt)}</td>

                    <td>
                      <Link
                        to={`/app/evaluations/${evaluation.id}`}
                        className="evaluations-page__detail-link"
                        aria-label={`Ver detalle de la evaluación ${evaluation.id}`}
                      >
                        Ver detalle
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ): null}
      </Card>
    </div>
  );
}
