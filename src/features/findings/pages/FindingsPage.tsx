
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Search, RefreshCw } from 'lucide-react';

import { Card } from '../../../components/ui/Card/Card';

import {
  fetchEvaluations,
  fetchEvaluationById,
  type BackendEvaluation,
  type BackendRuleResult,
} from '../../evaluations/services/evaluations.api';

import './FindingsPage.css';

type FindingStatus = 'FAIL' | 'WARNING';
type Severity = NonNullable<BackendRuleResult['severity']>;
type SeverityFilter = Severity | 'ALL';
type StatusFilter = FindingStatus | 'ALL';

interface FindingRow {
  id: string;
  evaluationId: string;
  apiName: string;
  apiVersion: string;
  documentName: string;
  ruleId: string;
  ruleName: string;
  category: string;
  severity: Severity | null;
  status: FindingStatus;
  message: string;
  evidence: string | null;
  recommendation: string | null;
  evaluatedAt: string;
}

const severityOrder: Record<Severity, number> = {
  CRITICAL: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

const severityLabels: Record<Severity, string> = {
  CRITICAL: 'Crítica',
  HIGH: 'Alta',
  MEDIUM: 'Media',
  LOW: 'Baja',
};

const categoryLabels: Record<string, string> = {
  DESIGN: 'Diseño',
  DOCUMENTATION: 'Documentación',
  SECURITY: 'Seguridad',
  VERSIONING: 'Versionamiento',
  OBSERVABILITY: 'Observabilidad',
  GOVERNANCE: 'Gobierno',
};

async function loadFindings(): Promise<FindingRow[]> {
  const evaluations = await fetchEvaluations();

  // La primera evaluación de cada documento será
  // la más reciente, según la fecha de solicitud.
  const ordered = [...evaluations].sort(
    (a, b) =>
      new Date(b.requestedAt).getTime() -
      new Date(a.requestedAt).getTime(),
  );

  const latestByDocument = new Map<string, BackendEvaluation>();

  for (const evaluation of ordered) {
    if (!latestByDocument.has(evaluation.documentId)) {
      latestByDocument.set(evaluation.documentId, evaluation);
    }
  }

  // Una evaluación nueva pendiente no debe mostrar
  // resultados históricos como si fueran vigentes.
  const completed = [...latestByDocument.values()].filter(
    (evaluation) => evaluation.status === 'COMPLETED',
  );

  const details = await Promise.all(
    completed.map((evaluation) =>
      fetchEvaluationById(evaluation.id),
    ),
  );

  return details.flatMap((evaluation): FindingRow[] => {
    const document = evaluation.document;
    const version = document?.apiVersion;
    const api = version?.api;

    return (evaluation.results ?? [])
      .filter(
        (result): result is BackendRuleResult & {
          status: FindingStatus;
        } =>
          result.status === 'FAIL' ||
          result.status === 'WARNING',
      )
      .map((result) => ({
        id: result.id,
        evaluationId: evaluation.id,
        apiName: api?.name ?? 'API no disponible',
        apiVersion: version?.version ?? '—',
        documentName: document?.fileName ?? 'Documento no disponible',
        ruleId: result.ruleId,
        ruleName: result.ruleName ?? result.ruleId,
        category: result.category ?? 'UNKNOWN',
        severity: result.severity,
        status: result.status,
        message: result.message,
        evidence: result.evidence,
        recommendation: result.recommendation,
        evaluatedAt:
          evaluation.completedAt ?? evaluation.requestedAt,
      }));
  });
}

export function FindingsPage() {
  const [findings, setFindings] = useState<FindingRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] =
    useState<SeverityFilter>('ALL');
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>('ALL');

  useEffect(() => {
    let active = true;

    void loadFindings()
      .then((data) => {
        if (!active) return;
        setFindings(data);
        setError(null);
      })
      .catch(() => {
        if (!active) return;
        setError(
          'No fue posible obtener los hallazgos desde NestJS.',
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
          finding.apiVersion,
          finding.documentName,
          finding.ruleId,
          finding.ruleName,
          finding.message,
        ]
          .join(' ')
          .toLowerCase();

        return (
          searchable.includes(term) &&
          (severityFilter === 'ALL' ||
            finding.severity === severityFilter) &&
          (statusFilter === 'ALL' ||
            finding.status === statusFilter)
        );
      })
      .sort((a, b) => {
        const priorityA = a.severity
          ? severityOrder[a.severity]
          : 0;

        const priorityB = b.severity
          ? severityOrder[b.severity]
          : 0;

        return (
          priorityB - priorityA ||
          new Date(b.evaluatedAt).getTime() -
            new Date(a.evaluatedAt).getTime()
        );
      });
  }, [findings, search, severityFilter, statusFilter]);

  const failures = findings.filter(
    (finding) => finding.status === 'FAIL',
  ).length;

  const blocking = findings.filter(
    (finding) =>
      finding.status === 'FAIL' &&
      (finding.severity === 'HIGH' ||
        finding.severity === 'CRITICAL'),
  ).length;

  const warnings = findings.filter(
    (finding) => finding.status === 'WARNING',
  ).length;

  return (
    <div className="findings-page">
      <header className="findings-page__header">
        <div>
          <h1>Hallazgos de gobierno</h1>
          <p>
            Incumplimientos y advertencias detectados
            durante las evaluaciones OpenAPI.
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
          <span>Incumplimientos</span>
          <strong>{failures}</strong>
        </Card>

        <Card className="findings-page__metric">
          <span>Bloqueantes</span>
          <strong>{blocking}</strong>
        </Card>

        <Card className="findings-page__metric">
          <span>Advertencias</span>
          <strong>{warnings}</strong>
        </Card>
      </section>

      <Card className="findings-page__content">
        <div className="findings-page__section-heading">
          <h2>Resultados de las reglas</h2>
          <p>
            Se considera la evaluación más reciente
            de cada documento, cuando está completada.
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
              setSeverityFilter(
                event.target.value as SeverityFilter,
              )
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
              setStatusFilter(
                event.target.value as StatusFilter,
              )
            }
            aria-label="Filtrar por resultado"
          >
            <option value="ALL">Todos los resultados</option>
            <option value="FAIL">Incumplimientos</option>
            <option value="WARNING">Advertencias</option>
          </select>
        </div>

        {isLoading && (
          <p role="status">Consultando hallazgos...</p>
        )}

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
              No existen resultados que coincidan
              con los filtros seleccionados.
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
                      {finding.apiName} · v{finding.apiVersion}
                      {' · '}
                      {finding.documentName}
                    </small>
                  </div>

                  <span
                    className={
                      `findings-page__severity ` +
                      `findings-page__severity--${
                        finding.severity?.toLowerCase() ?? 'unknown'
                      }`
                    }
                  >
                    {finding.severity
                      ? severityLabels[finding.severity]
                      : 'Sin severidad'}
                  </span>
                </div>

                <div className="findings-page__metadata">
                  <span>
                    {categoryLabels[finding.category] ??
                      finding.category}
                  </span>
                  <span>{finding.status}</span>
                  <span>
                    {new Date(finding.evaluatedAt)
                      .toLocaleDateString('es-CL')}
                  </span>
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
