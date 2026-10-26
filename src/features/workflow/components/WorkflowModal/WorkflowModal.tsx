
import {
  useEffect,
  useState,
  type FormEvent,
} from 'react';

import { History, X } from 'lucide-react';

import { useAuth } from '../../../auth/context/AuthContext';

import type {
  ApiVersion,
} from '../../../versions/types/version.types';

import type {
  WorkflowHistory,
  WorkflowStatus,
} from '../../types/workflow.types';

import {
  workflowStatusLabels,
} from '../../types/workflow.types';

import {
  changeWorkflowStatusRequest,
  fetchWorkflowHistory,
} from '../../services/workflow.api';

import './WorkflowModal.css';

interface WorkflowModalProps {
  version: ApiVersion;
  onClose: () => void;
  onUpdated: () => Promise<void>;
}

interface WorkflowAction {
  toStatus: WorkflowStatus;
  label: string;
  roles: readonly string[];
  requiresComment: boolean;
}

const ACTIONS: Record<
  WorkflowStatus,
  WorkflowAction[]
> = {
  DRAFT: [
    {
      toStatus: 'IN_REVIEW',
      label: 'Solicitar revisión',
      roles: ['ADMIN', 'DEVELOPER'],
      requiresComment: false,
    },
  ],
  IN_REVIEW: [
    {
      toStatus: 'OBSERVED',
      label: 'Registrar observaciones',
      roles: ['ADMIN', 'REVIEWER'],
      requiresComment: true,
    },
    {
      toStatus: 'APPROVED',
      label: 'Aprobar versión',
      roles: ['ADMIN', 'REVIEWER'],
      requiresComment: false,
    },
  ],
  OBSERVED: [
    {
      toStatus: 'CORRECTED',
      label: 'Registrar correcciones',
      roles: ['ADMIN', 'DEVELOPER'],
      requiresComment: true,
    },
  ],
  CORRECTED: [
    {
      toStatus: 'IN_REVIEW',
      label: 'Reenviar a revisión',
      roles: ['ADMIN', 'DEVELOPER'],
      requiresComment: false,
    },
  ],
  APPROVED: [
    {
      toStatus: 'PUBLISHED',
      label: 'Publicar versión',
      roles: ['ADMIN'],
      requiresComment: false,
    },
  ],
  PUBLISHED: [],
};

export function WorkflowModal({
  version,
  onClose,
  onUpdated,
}: WorkflowModalProps) {
  const { user } = useAuth();

  const [history, setHistory] =
    useState<WorkflowHistory | null>(null);

  const [currentStatus, setCurrentStatus] =
    useState<WorkflowStatus>(version.workflowStatus);

  const [selectedStatus, setSelectedStatus] =
    useState<WorkflowStatus | ''>('');

  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [historyError, setHistoryError] = useState('');

  useEffect(() => {
    let active = true;

    void fetchWorkflowHistory(version.apiId, version.id)
      .then((result) => {
        if (!active) return;
        setHistory(result);
        setCurrentStatus(result.currentStatus);
      })
      .catch(() => {
        if (active) {
          setHistoryError(
            'No fue posible cargar el historial del workflow.',
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
  }, [version.apiId, version.id]);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    }

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isSubmitting, onClose]);

  const availableActions = ACTIONS[currentStatus].filter(
    (action) =>
      user?.roles.some((role) =>
        action.roles.includes(role),
      ) ?? false,
  );

  const selectedAction = availableActions.find(
    (action) => action.toStatus === selectedStatus,
  );

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!selectedAction || isSubmitting || isLoading) {
      return;
    }

    if (
      selectedAction.requiresComment &&
      !comment.trim()
    ) {
      setError('Debes ingresar un comentario.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await changeWorkflowStatusRequest({
        apiId: version.apiId,
        versionId: version.id,
        toStatus: selectedAction.toStatus,
        comment: comment.trim() || undefined,
      });

      // Consultamos nuevamente el estado e historial real.
      const updatedHistory = await fetchWorkflowHistory(
        version.apiId,
        version.id,
      );

      setHistory(updatedHistory);
      setCurrentStatus(updatedHistory.currentStatus);
      setSelectedStatus('');
      setComment('');
      setHistoryError('');

      await onUpdated();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'No fue posible cambiar el estado.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="workflow-modal__overlay">
      <section
        className="workflow-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="workflow-modal-title"
      >
        <header className="workflow-modal__header">
          <div>
            <h2 id="workflow-modal-title">
              Gestión del workflow
            </h2>
            <p>Versión v{version.version}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Cerrar workflow"
            className="workflow-modal__close"
          >
            <X size={19} />
          </button>
        </header>

        <div className="workflow-modal__body">
          <div className="workflow-modal__current">
            <span>Estado actual</span>
            <strong>
              {workflowStatusLabels[currentStatus]}
            </strong>
          </div>

          {isLoading ? (
            <p role="status">
              Consultando workflow...
            </p>
          ) : (
            <>
              <section className="workflow-modal__section">
                <h3>Acciones disponibles</h3>

                {availableActions.length === 0 ? (
                  <p className="workflow-modal__muted">
                    No tienes acciones disponibles para
                    este estado.
                  </p>
                ) : (
                  <form onSubmit={(event) => void handleSubmit(event)}>
                    <label htmlFor="workflow-action">
                      Acción
                    </label>

                    <select
                      id="workflow-action"
                      value={selectedStatus}
                      onChange={(event) => {
                        setSelectedStatus(
                          event.target.value as WorkflowStatus | '',
                        );
                        setError('');
                      }}
                      disabled={isSubmitting}
                      required
                    >
                      <option value="">
                        Selecciona una acción
                      </option>

                      {availableActions.map((action) => (
                        <option
                          key={action.toStatus}
                          value={action.toStatus}
                        >
                          {action.label}
                        </option>
                      ))}
                    </select>

                    {selectedAction && (
                      <>
                        <label htmlFor="workflow-comment">
                          Comentario
                          {selectedAction.requiresComment
                            ? ' *'
                            : ' (opcional)'}
                        </label>

                        <textarea
                          id="workflow-comment"
                          rows={4}
                          maxLength={2000}
                          required={
                            selectedAction.requiresComment
                          }
                          disabled={isSubmitting}
                          value={comment}
                          onChange={(event) =>
                            setComment(event.target.value)
                          }
                          placeholder="Describe el motivo de la transición..."
                        />

                        <button
                          type="submit"
                          className="workflow-modal__submit"
                          disabled={isSubmitting}
                        >
                          {isSubmitting
                            ? 'Guardando...'
                            : selectedAction.label}
                        </button>
                      </>
                    )}
                  </form>
                )}

                {error && (
                  <p
                    role="alert"
                    className="workflow-modal__error"
                  >
                    {error}
                  </p>
                )}
              </section>

              <section className="workflow-modal__section">
                <h3 className="workflow-modal__history-title">
                  <History size={17} />
                  Historial de transiciones
                </h3>

                {historyError && (
                  <p role="alert" className="workflow-modal__error">
                    {historyError}
                  </p>
                )}

                {!historyError &&
                  history?.transitions.length === 0 && (
                    <p className="workflow-modal__muted">
                      Todavía no se han registrado
                      transiciones para esta versión.
                    </p>
                  )}

                <ol className="workflow-modal__history">
                  {history?.transitions.map((item) => (
                    <li key={item.id}>
                      <strong>
                        {workflowStatusLabels[item.fromStatus]}
                        {' → '}
                        {workflowStatusLabels[item.toStatus]}
                      </strong>

                      <span>
                        {item.performedBy.displayName}
                        {' · '}
                        {new Date(item.createdAt)
                          .toLocaleString('es-CL')}
                      </span>

                      {item.comment && (
                        <p>{item.comment}</p>
                      )}
                    </li>
                  ))}
                </ol>
              </section>
            </>
          )}
        </div>

        <footer className="workflow-modal__footer">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cerrar
          </button>
        </footer>
      </section>
    </div>
  );
}
