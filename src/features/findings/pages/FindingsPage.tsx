import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Search, RefreshCw } from "lucide-react";

import { Card } from "../../../components/ui/Card/Card";

import { fetchFindings } from "../services/findings.api";

import type {
  Finding,
  FindingSeverity,
  FindingState,
  FindingStatus,
  FindingsSummary,
} from "../types/finding.types";

import { findingStateLabels } from "../types/finding.types";

import "./FindingsPage.css";

type SeverityFilter = FindingSeverity | "ALL";
type StatusFilter = FindingStatus | "ALL";
type StateFilter = FindingState | "ALL";

const severityOrder: Record<FindingSeverity, number> = {
  CRITICAL: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

const severityLabels: Record<FindingSeverity, string> = {
  CRITICAL: "Crítica",
  HIGH: "Alta",
  MEDIUM: "Media",
  LOW: "Baja",
};

const categoryLabels: Record<string, string> = {
  DESIGN: "Diseño",
  DOCUMENTATION: "Documentación",
  SECURITY: "Seguridad",
  VERSIONING: "Versionamiento",
  OBSERVABILITY: "Observabilidad",
  GOVERNANCE: "Gobierno",
};

export function FindingsPage() {
  const [findings, setFindings] = useState<Finding[]>([]);

  const [summary, setSummary] = useState<FindingsSummary>({
    total: 0,
    new: 0,
    persistent: 0,
    resolved: 0,
    pendingEvaluationVersions: 0,
  });

  const [stateFilter, setStateFilter] = useState<StateFilter>("ALL");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  useEffect(() => {
    let active = true;

    void fetchFindings()
      .then((response) => {
        if (!active) return;

        setFindings(response.findings);
        setSummary(response.summary);
        setError(null);
      })
      .catch((error: unknown) => {
        if (!active) return;

        setFindings([]);

        setError(
          error instanceof Error
            ? error.message
            : "No fue posible consultar los hallazgos.",
        );
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [reloadKey]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return findings
      .filter((finding) => {
        const searchable = [
          finding.apiName,
          finding.version,
          finding.documentName,
          finding.ruleId,
          finding.ruleName,
          finding.message,
        ]
          .join(" ")
          .toLowerCase();
        const matchesState =
          stateFilter === "ALL" || finding.state === stateFilter;
        return (
          searchable.includes(term) &&
          (severityFilter === "ALL" || finding.severity === severityFilter) &&
          (statusFilter === "ALL" || finding.status === statusFilter) &&
          matchesState
        );
      })
      .sort((a, b) => {
        const priorityA = a.severity ? severityOrder[a.severity] : 0;

        const priorityB = b.severity ? severityOrder[b.severity] : 0;

        return (
          priorityB - priorityA ||
          new Date(b.evaluatedAt).getTime() - new Date(a.evaluatedAt).getTime()
        );
      });
  }, [findings, search, severityFilter, statusFilter, stateFilter]);

  const activeFindings = findings.filter(
    (finding) => finding.state !== "RESOLVED",
  );

  const failures = activeFindings.filter(
    (finding) => finding.status === "FAIL",
  ).length;

  const blocking = activeFindings.filter(
    (finding) =>
      finding.status === "FAIL" &&
      (finding.severity === "HIGH" || finding.severity === "CRITICAL"),
  ).length;

  const warnings = activeFindings.filter(
    (finding) => finding.status === "WARNING",
  ).length;

  return (
    <div className="findings-page">
      <header className="findings-page__header">
        <div>
          <h1>Hallazgos de gobierno</h1>
          <p>
            Incumplimientos y advertencias detectados durante las evaluaciones
            OpenAPI.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsLoading(true);
            setError(null);
            setReloadKey((current) => current + 1);
          }}
          disabled={isLoading}
          className="findings-page__refresh"
        >
          <RefreshCw size={16} />
          Actualizar
        </button>
      </header>

      <section className="findings-page__metrics">
        <Card className="findings-page__metric">
          <span>Nuevos</span>
          <strong>{summary.new}</strong>
        </Card>

        <Card className="findings-page__metric">
          <span>Persistentes</span>
          <strong>{summary.persistent}</strong>
        </Card>

        <Card className="findings-page__metric">
          <span>Corregidos</span>
          <strong>{summary.resolved}</strong>
        </Card>

        <Card className="findings-page__metric">
          <span>Incumplimientos vigentes</span>
          <strong>{failures}</strong>
        </Card>

        <Card className="findings-page__metric">
          <span>Bloqueantes vigentes</span>
          <strong>{blocking}</strong>
        </Card>

        <Card className="findings-page__metric">
          <span>Advertencias vigentes</span>
          <strong>{warnings}</strong>
        </Card>
      </section>

      {!isLoading && !error && summary.pendingEvaluationVersions > 0 && (
        <p className="findings-page__notice">
          Hay {summary.pendingEvaluationVersions} versión(es) cuyo documento
          vigente todavía no dispone de una evaluación completada. Sus hallazgos
          actuales no se consideran verificados.
        </p>
      )}

      <Card className="findings-page__content">
        <div className="findings-page__section-heading">
          <h2>Resultados de las reglas</h2>
          <p>
            Se considera la evaluación más reciente de cada documento, cuando
            está completada.
          </p>
        </div>

        <div className="findings-page__filters">
          <label className="findings-page__search">
            <Search size={17} />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar API, regla o descripción..."
              aria-label="Buscar hallazgos"
            />
          </label>

          <select
            value={severityFilter}
            onChange={(event) =>
              setSeverityFilter(event.target.value as SeverityFilter)
            }
            aria-label="Filtrar por severidad"
          >
            <option value="ALL">Todas las severidades</option>
            <option value="CRITICAL">Crítica</option>
            <option value="HIGH">Alta</option>
            <option value="MEDIUM">Media</option>
            <option value="LOW">Baja</option>
          </select>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as StatusFilter)
            }
            aria-label="Filtrar por resultado"
          >
            <option value="ALL">Todos los resultados</option>
            <option value="PASS">Cumple</option>
            <option value="FAIL">Incumplimientos</option>
            <option value="WARNING">Advertencias</option>
          </select>

          <select
            value={stateFilter}
            onChange={(event) =>
              setStateFilter(event.target.value as StateFilter)
            }
            aria-label="Filtrar por seguimiento"
          >
            <option value="ALL">Todos los seguimientos</option>
            <option value="NEW">Nuevos</option>
            <option value="PERSISTENT">Persistentes</option>
            <option value="RESOLVED">Corregidos</option>
          </select>
        </div>

        {isLoading && <p role="status">Consultando hallazgos...</p>}

        {error && (
          <p role="alert" className="findings-page__error">
            {error}
          </p>
        )}

        {!isLoading && !error && filtered.length === 0 && (
          <div className="findings-page__empty">
            <AlertTriangle size={24} />
            <strong>No se encontraron hallazgos</strong>
            <p>
              No existen resultados que coincidan con los filtros seleccionados.
            </p>
          </div>
        )}

        {!isLoading && !error && filtered.length > 0 && (
          <div className="findings-page__list">
            {filtered.map((finding) => (
              <article
                key={`${finding.evaluationId}-${finding.id}`}
                className="findings-page__item"
              >
                <div className="findings-page__item-heading">
                  <div>
                    <strong>
                      {finding.ruleId} — {finding.ruleName}
                    </strong>
                    <small>
                      {finding.apiName} · v{finding.version}
                      {" · "}
                      {finding.documentName}
                    </small>
                  </div>

                  <span
                    className={
                      `findings-page__severity ` +
                      `findings-page__severity--${
                        finding.severity?.toLowerCase() ?? "unknown"
                      }`
                    }
                  >
                    {finding.severity
                      ? severityLabels[finding.severity]
                      : "Sin severidad"}
                  </span>
                </div>

                <div className="findings-page__metadata">
                  <span>
                    {finding.category
                      ? (categoryLabels[finding.category] ?? finding.category)
                      : "Sin categoría"}
                  </span>
                  <span>{finding.status}</span>
                  <span>
                    {new Date(finding.evaluatedAt).toLocaleDateString("es-CL")}
                  </span>

                  <span
                    className={
                      `findings-page__state ` +
                      `findings-page__state--${finding.state.toLowerCase()}`
                    }
                  >
                    {findingStateLabels[finding.state]}
                  </span>

                  {finding.previousStatus && (
                    <span>
                      Antes: {finding.previousStatus}
                      {" → "}
                      Ahora: {finding.status}
                    </span>
                  )}
                </div>

                <p>{finding.message}</p>

                {finding.recommendation && (
                  <div className="findings-page__recommendation">
                    <strong>Recomendación</strong>
                    <p>{finding.recommendation}</p>
                  </div>
                )}

                {finding.evidence && (
                  <details className="findings-page__evidence">
                    <summary>Ver evidencia técnica</summary>
                    <pre>{finding.evidence}</pre>
                  </details>
                )}

                <Link
                  to={`/app/evaluations/${encodeURIComponent(
                    finding.evaluationId,
                  )}`}
                  className="findings-page__detail-link"
                >
                  Ver evaluación de origen
                </Link>
              </article>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
