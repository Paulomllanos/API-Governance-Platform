import { useEffect, useState } from 'react';
import { Activity, RefreshCw, ChevronDown, FileText, GitBranch, CheckCircle2, UploadCloud, Layers3 } from 'lucide-react';
import { Card } from '../../../components/ui/Card/Card';
import {
  fetchOperationalAudit,
  type OperationalAuditResponse,
} from '../services/audit-activity.api';

const ACTION_ICONS: Record<string, typeof Activity> = {
  WORKFLOW_TRANSITION: GitBranch,
  EVALUATION_COMPLETED: CheckCircle2,
  EVALUATION_REQUESTED: FileText,
  OPENAPI_DOCUMENT_UPLOADED: UploadCloud,
  API_VERSION_CREATED: Layers3,
};

const ACTION_LABELS: Record<string, string> = {
  API_CREATED: 'API registrada',
  API_UPDATED: 'API actualizada',
  API_VERSION_CREATED: 'Versión registrada',
  OPENAPI_DOCUMENT_UPLOADED: 'Especificación cargada',
  EVALUATION_REQUESTED: 'Evaluación solicitada',
  EVALUATION_COMPLETED: 'Evaluación completada',
  EVALUATION_FAILED: 'Evaluación fallida',
  WORKFLOW_TRANSITION: 'Cambio en el workflow',
  USER_CREATED: 'Usuario creado',
  USER_ADMIN_UPDATED: 'Roles o estado de usuario actualizados',
  PROFILE_UPDATED: 'Perfil actualizado',
  PASSWORD_CHANGED: 'Contraseña actualizada',
};

export function OperationalAuditSection() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<OperationalAuditResponse | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    void fetchOperationalAudit(page)
      .then((response) => {
        if (active) setData(response);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : 'No fue posible consultar la actividad.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [page, reload]);

  return (
    <Card className="audit-page__content audit-page__operations">
      <div className="audit-page__content-header">
        <div>
          <h2 className="audit-page__section-title"><span className="audit-page__section-icon"><Activity size={21} aria-hidden="true" /></span>Actividad técnica y administrativa</h2>
          <p>Operaciones del sistema registradas con usuario, recurso y fecha.</p>
        </div>
        <button type="button" className="audit-page__refresh audit-page__operations-refresh" disabled={loading} onClick={() => setReload((n) => n + 1)}>
          <RefreshCw size={16} aria-hidden="true" />Actualizar
        </button>
      </div>
      {loading && <p role="status">Cargando actividad...</p>}
      {error && <p role="alert">{error}</p>}
      {!loading && !error && data && (
        <>
          <div className="audit-page__table-scroll">
            <table className="audit-page__table">
              <thead>
                <tr>
                  <th>Acción</th>
                  <th>Usuario</th>
                  <th>Recurso</th>
                  <th>Fecha</th>
                  <th>Detalle</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => (
                  <tr key={item.id}>
                    <td><span className="audit-page__action-cell"><span className="audit-page__action-icon">{(() => { const Icon = ACTION_ICONS[item.action] ?? Activity; return <Icon size={16} aria-hidden="true" />; })()}</span><strong>{ACTION_LABELS[item.action] ?? item.action}</strong></span></td>
                    <td>
                      <strong>{item.actor?.displayName ?? 'Cuenta no disponible'}</strong>
                      <small>{item.actor?.email ?? 'Sin identificación adicional'}</small>
                    </td>
                    <td><div className="audit-page__resource"><span>{item.entityType}</span><small title={item.entityId ?? undefined}>{item.entityId ?? '—'}</small></div></td>
                    <td><time dateTime={item.createdAt} className="audit-page__operation-date">{new Date(item.createdAt).toLocaleString('es-CL')}</time></td>
                    <td>
                      {item.detail ? (
                        <details className="audit-page__operation-details">
                          <summary>Ver datos <ChevronDown size={14} aria-hidden="true" /></summary>
                          <pre>{JSON.stringify(item.detail, null, 2)}</pre>
                        </details>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
                {data.items.length === 0 && (
                  <tr><td colSpan={5}>Todavía no hay actividades registradas.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {data.pagination.totalPages > 1 && (
            <div className="audit-page__pagination">
              <button type="button" disabled={page <= 1} onClick={() => setPage((n) => n - 1)}>
                Anterior
              </button>
              <span>Página {data.pagination.page} de {data.pagination.totalPages}</span>
              <button type="button" disabled={page >= data.pagination.totalPages} onClick={() => setPage((n) => n + 1)}>
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
