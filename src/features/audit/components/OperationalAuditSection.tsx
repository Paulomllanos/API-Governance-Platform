import { useEffect, useState } from 'react';
import { Card } from '../../../components/ui/Card/Card';
import {
  fetchOperationalAudit,
  type OperationalAuditResponse,
} from '../services/audit-activity.api';

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
    <Card className="audit-page__content">
      <div className="audit-page__content-header">
        <div>
          <h2>Actividad técnica y administrativa</h2>
          <p>Operaciones del sistema registradas con usuario, recurso y fecha.</p>
        </div>
        <button type="button" disabled={loading} onClick={() => setReload((n) => n + 1)}>
          Actualizar
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
                    <td>{ACTION_LABELS[item.action] ?? item.action}</td>
                    <td>
                      <strong>{item.actor?.displayName ?? 'Cuenta no disponible'}</strong>
                      <small>{item.actor?.email ?? 'Sin identificación adicional'}</small>
                    </td>
                    <td>
                      {item.entityType}
                      <small>{item.entityId ?? '—'}</small>
                    </td>
                    <td>{new Date(item.createdAt).toLocaleString('es-CL')}</td>
                    <td>
                      {item.detail ? (
                        <details>
                          <summary>Ver datos</summary>
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
