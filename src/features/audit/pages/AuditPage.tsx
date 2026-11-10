
import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import { Link } from 'react-router-dom';

import {
  RefreshCw,
  Search,
  ScrollText,
} from 'lucide-react';

import {
  Card,
} from '../../../components/ui/Card/Card';

import {
  workflowStatusLabels,
} from '../../workflow/types/workflow.types';

import type {
  WorkflowStatus,
} from '../../workflow/types/workflow.types';

import {
  fetchAuditEvents,
} from '../services/audit.api';

import type {
  AuditEvent,
  AuditResponse,
} from '../types/audit.types';

import './AuditPage.css';

type AuditFilter = WorkflowStatus | 'ALL';

const eventOptions: WorkflowStatus[] = [
  'IN_REVIEW',
  'OBSERVED',
  'CORRECTED',
  'APPROVED',
  'PUBLISHED',
];

function formatDate(value: string): string {
  return new Date(value).toLocaleString('es-CL', {
    dateStyle: 'short',
    timeStyle: 'medium',
  });
}

function AuditEventRow({
  event,
}: {
  event: AuditEvent;
}) {
  return (
    <tr>
      <td>
        <div className="audit-page__api">
          <strong>{event.api.name}</strong>
          <span>v{event.version.number}</span>
          <small>{event.api.owner}</small>
        </div>
      </td>

      <td>
        <span
          className={
            `audit-page__status ` +
            `audit-page__status--${event.toStatus.toLowerCase()}`
          }
        >
          {workflowStatusLabels[event.toStatus]}
        </span>

        <small className="audit-page__transition">
          {workflowStatusLabels[event.fromStatus]}
          {' → '}
          {workflowStatusLabels[event.toStatus]}
        </small>
      </td>

      <td>
        <div className="audit-page__actor">
          <strong>{event.performedBy.displayName}</strong>
          <small>{event.performedBy.email}</small>
        </div>
      </td>

      <td>
        <time dateTime={event.createdAt}>
          {formatDate(event.createdAt)}
        </time>
      </td>

      <td>
        <details className="audit-page__details">
          <summary>Ver detalle</summary>

          <div className="audit-page__detail-content">
            <strong>Comentario</strong>
            <p>
              {event.comment ||
                'Sin comentario registrado.'}
            </p>

            {event.approvalEvidence && (
              <div className="audit-page__evidence">
                <strong>Evidencia de aprobación</strong>

                <div className="audit-page__evidence-grid">
                  <div>
                    <span>Quality Score</span>
                    <strong>
                      {event.approvalEvidence.qualityScore
                        ?.toLocaleString('es-CL') ?? '—'}
                      /100
                    </strong>
                  </div>

                  <div>
                    <span>Reglas evaluadas</span>
                    <strong>
                      {event.approvalEvidence.evaluatedRules
                        ?? '—'}
                      /18
                    </strong>
                  </div>

                  <div>
                    <span>Hallazgos bloqueantes</span>
                    <strong>
                      {event.approvalEvidence.hasBlockingIssues
                        === false
                        ? 'No'
                        : event.approvalEvidence
                            .hasBlockingIssues === true
                          ? 'Sí'
                          : 'Sin información'}
                    </strong>
                  </div>
                </div>

                <span>Documento evaluado</span>
                <code>
                  {event.approvalEvidence.documentId
                    ?? 'No disponible'}
                </code>

                {event.approvalEvidence.evaluationId && (
                  <Link
                    to={
                      `/app/evaluations/` +
                      encodeURIComponent(
                        event.approvalEvidence.evaluationId,
                      )
                    }
                  >
                    Ver evaluación completa
                  </Link>
                )}
              </div>
            )}

            <Link to={`/app/apis/${event.api.id}`}>
              Consultar API
            </Link>
          </div>
        </details>
      </td>
    </tr>
  );
}

export function AuditPage() {
  const [response, setResponse] =
    useState<AuditResponse | null>(null);

  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);

  const [search, setSearch] = useState('');
  const [eventFilter, setEventFilter] =
    useState<AuditFilter>('ALL');

  const [loading, setLoading] = useState(true);
  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load(): Promise<void> {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchAuditEvents(page, 20);

        if (active) {
          setResponse(data);
        }
      } catch (cause) {
        if (active) {
          setError(
            cause instanceof Error
              ? cause.message
              : 'No fue posible cargar la auditoría.',
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [page, reloadKey]);

  const filteredEvents = useMemo(() => {
    const term = search.trim().toLowerCase();

    return (response?.items ?? []).filter((event) => {
      const matchesText = [
        event.api.name,
        event.api.owner,
        event.version.number,
        event.performedBy.displayName,
        event.performedBy.email,
        event.comment ?? '',
      ]
        .join(' ')
        .toLowerCase()
        .includes(term);

      const matchesEvent =
        eventFilter === 'ALL' ||
        event.toStatus === eventFilter;

      return matchesText && matchesEvent;
    });
  }, [response, search, eventFilter]);

  const summary = response?.summary;
  const pagination = response?.pagination;

  return (
    <div className="audit-page">
      <header className="audit-page__header">
        <div>
          <h1>Auditoría de gobierno</h1>
          <p>
            Consulta el historial de transiciones,
            responsables y evidencias del workflow.
          </p>
        </div>

        <button
          type="button"
          className="audit-page__refresh"
          disabled={loading}
          onClick={() =>
            setReloadKey((current) => current + 1)
          }
        >
          <RefreshCw size={16} />
          Actualizar
        </button>
      </header>

      <section
        className="audit-page__metrics"
        aria-label="Indicadores de auditoría"
      >
        <Card className="audit-page__metric">
          <span>Eventos registrados</span>
          <strong>{summary?.total ?? 0}</strong>
        </Card>

        <Card className="audit-page__metric">
          <span>Aprobaciones</span>
          <strong>{summary?.approvals ?? 0}</strong>
        </Card>

        <Card className="audit-page__metric">
          <span>Publicaciones</span>
          <strong>{summary?.publications ?? 0}</strong>
        </Card>

        <Card className="audit-page__metric">
          <span>Observaciones</span>
          <strong>{summary?.observations ?? 0}</strong>
        </Card>
      </section>

      <Card className="audit-page__content">
        <div className="audit-page__content-header">
          <div>
            <h2>Historial de actividad</h2>
            <p>
              Registro cronológico de decisiones
              del gobierno de APIs.
            </p>
          </div>
          <span>{pagination?.total ?? 0} eventos</span>
        </div>

        <div className="audit-page__filters">
          <label className="audit-page__search">
            <Search size={17} />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Buscar API, usuario o comentario..."
              aria-label="Buscar eventos"
            />
          </label>

          <select
            value={eventFilter}
            onChange={(event) =>
              setEventFilter(
                event.target.value as AuditFilter,
              )
            }
            aria-label="Filtrar por evento"
          >
            <option value="ALL">Todos los eventos</option>

            {eventOptions.map((status) => (
              <option key={status} value={status}>
                {workflowStatusLabels[status]}
              </option>
            ))}
          </select>
        </div>

        <p className="audit-page__filter-note">
          La búsqueda y el filtro se aplican a los
          registros de la página actual.
        </p>

        {loading && (
          <p role="status" className="audit-page__message">
            Cargando eventos de auditoría...
          </p>
        )}

        {error && (
          <p role="alert" className="audit-page__error">
            {error}
          </p>
        )}

        {!loading && !error &&
          filteredEvents.length === 0 && (
            <div className="audit-page__empty">
              <ScrollText size={28} />
              <strong>No se encontraron eventos</strong>
              <p>
                No hay registros que coincidan con
                los filtros de esta página.
              </p>
            </div>
          )}

        {!loading && !error &&
          filteredEvents.length > 0 && (
            <div className="audit-page__table-scroll">
              <table className="audit-page__table">
                <thead>
                  <tr>
                    <th>API / Versión</th>
                    <th>Evento</th>
                    <th>Responsable</th>
                    <th>Fecha</th>
                    <th>Detalle</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredEvents.map((event) => (
                    <AuditEventRow
                      key={event.id}
                      event={event}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

        {!loading && !error &&
          pagination &&
          pagination.totalPages > 1 && (
            <div className="audit-page__pagination">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() =>
                  setPage((current) => current - 1)
                }
              >
                Anterior
              </button>

              <span>
                Página {pagination.page} de{' '}
                {pagination.totalPages}
              </span>

              <button
                type="button"
                disabled={
                  page >= pagination.totalPages
                }
                onClick={() =>
                  setPage((current) => current + 1)
                }
              >
                Siguiente
              </button>
            </div>
          )}
      </Card>
    </div>
  );
}
