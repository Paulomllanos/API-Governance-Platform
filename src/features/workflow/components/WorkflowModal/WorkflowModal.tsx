import { useEffect, useState, type FormEvent } from "react";

import { History, X } from "lucide-react";

import { useAuth } from "../../../auth/context/AuthContext";

import type { ApiVersion } from "../../../versions/types/version.types";

import type {
  WorkflowHistory,
  WorkflowStatus,
  WorkflowApprovalCheck,
} from "../../types/workflow.types";

import { workflowStatusLabels } from "../../types/workflow.types";

import {
  changeWorkflowStatusRequest,
  fetchWorkflowHistory,
  fetchWorkflowApprovalCheck,
} from "../../services/workflow.api";

import "./WorkflowModal.css";

import { Link } from "react-router-dom";

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

const ACTIONS: Record<WorkflowStatus, WorkflowAction[]> = {
  DRAFT: [
    {
      toStatus: "IN_REVIEW",
      label: "Solicitar revisión",
      roles: ["ADMIN", "DEVELOPER"],
      requiresComment: false,
    },
  ],
  IN_REVIEW: [
    {
      toStatus: "OBSERVED",
      label: "Registrar observaciones",
      roles: ["ADMIN", "REVIEWER"],
      requiresComment: true,
    },
    {
      toStatus: "APPROVED",
      label: "Aprobar versión",
      roles: ["ADMIN", "REVIEWER"],
      requiresComment: false,
    },
  ],
  OBSERVED: [
    {
      toStatus: "CORRECTED",
      label: "Registrar correcciones",
      roles: ["ADMIN", "DEVELOPER"],
      requiresComment: true,
    },
  ],
  CORRECTED: [
    {
      toStatus: "IN_REVIEW",
      label: "Reenviar a revisión",
      roles: ["ADMIN", "DEVELOPER"],
      requiresComment: false,
    },
  ],
  APPROVED: [
    {
      toStatus: "PUBLISHED",
      label: "Publicar versión",
      roles: ["ADMIN"],
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

  const [history, setHistory] = useState<WorkflowHistory | null>(null);

  const [currentStatus, setCurrentStatus] = useState<WorkflowStatus>(
    version.workflowStatus,
  );

  const [selectedStatus, setSelectedStatus] = useState<WorkflowStatus | "">("");

  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [historyError, setHistoryError] = useState("");

  const [approvalCheck, setApprovalCheck] =
    useState<WorkflowApprovalCheck | null>(null);

  const [isCheckingApproval, setIsCheckingApproval] = useState(false);

  const [approvalCheckError, setApprovalCheckError] = useState("");

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
          setHistoryError("No fue posible cargar el historial del workflow.");
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
      if (event.key === "Escape" && !isSubmitting) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isSubmitting, onClose]);

  const availableActions = ACTIONS[currentStatus].filter(
    (action) =>
      user?.roles.some((role) => action.roles.includes(role)) ?? false,
  );

  const selectedAction = availableActions.find(
    (action) => action.toStatus === selectedStatus,
  );

  useEffect(() => {
    if (currentStatus !== "IN_REVIEW" || selectedStatus !== "APPROVED") {
      setApprovalCheck(null);
      setApprovalCheckError("");
      return;
    }

    let active = true;

    setApprovalCheck(null);
    setApprovalCheckError("");
    setIsCheckingApproval(true);

    void fetchWorkflowApprovalCheck(version.apiId, version.id)
      .then((result) => {
        if (active) {
          setApprovalCheck(result);
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setApprovalCheckError(
            error instanceof Error
              ? error.message
              : "No fue posible verificar la aprobación.",
          );
        }
      })
      .finally(() => {
        if (active) {
          setIsCheckingApproval(false);
        }
      });

    return () => {
      active = false;
    };
  }, [version.apiId, version.id, currentStatus, selectedStatus]);

  

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedAction || isSubmitting || isLoading) {
      return;
    }

    if (selectedAction.toStatus === "APPROVED") {
      if (
        isCheckingApproval ||
        approvalCheckError ||
        !approvalCheck?.evaluationReady
      ) {
        setError("La versión no tiene una validación de aprobación favorable.");
        return;
      }
    }

    if (selectedAction.requiresComment && !comment.trim()) {
      setError("Debes ingresar un comentario.");
      return;
    }

    setIsSubmitting(true);
    setError("");

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
      setSelectedStatus("");
      setComment("");
      setHistoryError("");

      await onUpdated();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No fue posible cambiar el estado.",
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
            <h2 id="workflow-modal-title">Gestión del workflow</h2>
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
            <strong>{workflowStatusLabels[currentStatus]}</strong>
          </div>

          {isLoading ? (
            <p role="status">Consultando workflow...</p>
          ) : (
            <>
              <section className="workflow-modal__section">
                <h3>Acciones disponibles</h3>

                {availableActions.length === 0 ? (
                  <p className="workflow-modal__muted">
                    No tienes acciones disponibles para este estado.
                  </p>
                ) : (
                  <form onSubmit={(event) => void handleSubmit(event)}>
                    <label htmlFor="workflow-action">Acción</label>

                    <select
                      id="workflow-action"
                      value={selectedStatus}
                      onChange={(event) => {
                        setSelectedStatus(
                          event.target.value as WorkflowStatus | "",
                        );
                        setError("");
                      }}
                      disabled={isSubmitting}
                      required
                    >
                      <option value="">Selecciona una acción</option>

                      {availableActions.map((action) => (
                        <option key={action.toStatus} value={action.toStatus}>
                          {action.label}
                        </option>
                      ))}
                    </select>

                    {selectedAction && (
                      <>
                        {selectedAction.toStatus === "APPROVED" && (
                          <div className="workflow-modal__approval-check">
                            <h3>Validación de aprobación</h3>

                            {isCheckingApproval ? (
                              <p role="status">
                                Verificando condiciones de gobierno...
                              </p>
                            ) : approvalCheckError ? (
                              <p role="alert" className="workflow-modal__error">
                                {approvalCheckError}
                              </p>
                            ) : approvalCheck?.evaluationReady ? (
                              <div className="workflow-modal__approval-ready">
                                <strong>Aprobación habilitada</strong>

                                <p>
                                  La evaluación vigente cumple las condiciones
                                  necesarias para aprobar esta versión.
                                </p>

                                <div className="workflow-modal__approval-metrics">
                                  <span>
                                    Quality Score:{" "}
                                    <strong>
                                      {approvalCheck.evaluation?.qualityScore?.toLocaleString(
                                        "es-CL",
                                      ) ?? "—"}
                                      /100
                                    </strong>
                                  </span>

                                  <span>
                                    Reglas:{" "}
                                    <strong>
                                      {approvalCheck.evaluation?.resultsCount ??
                                        0}
                                      /18
                                    </strong>
                                  </span>
                                </div>
                              </div>
                            ) : approvalCheck ? (
                              <div className="workflow-modal__approval-blocked">
                                <strong>Aprobación bloqueada</strong>

                                <p>
                                  La versión no cumple todas las condiciones
                                  necesarias para aprobarse.
                                </p>

                                <ul>
                                  {approvalCheck.approvalBlockers.map(
                                    (reason, index) => (
                                      <li key={index}>{reason}</li>
                                    ),
                                  )}
                                </ul>

                                {approvalCheck.evaluation?.blockingRules.map(
                                  (rule) => (
                                    <div
                                      key={rule.id}
                                      className="workflow-modal__blocking-rule"
                                    >
                                      <strong>
                                        {rule.ruleId}
                                        {rule.ruleName
                                          ? ` — ${rule.ruleName}`
                                          : ""}
                                      </strong>

                                      <p>{rule.message}</p>

                                      {rule.recommendation && (
                                        <p>
                                          Recomendación: {rule.recommendation}
                                        </p>
                                      )}
                                    </div>
                                  ),
                                )}
                              </div>
                            ) : null}

                            {approvalCheck?.evaluation && (
                              <Link
                                className="workflow-modal__evidence-link"
                                to={`/app/evaluations/${encodeURIComponent(
                                  approvalCheck.evaluation.id,
                                )}`}
                              >
                                Ver evaluación completa
                              </Link>
                            )}
                          </div>
                        )}

                        <label htmlFor="workflow-comment">
                          Comentario
                          {selectedAction.requiresComment
                            ? " *"
                            : " (opcional)"}
                        </label>

                        <textarea
                          id="workflow-comment"
                          rows={4}
                          maxLength={2000}
                          required={selectedAction.requiresComment}
                          disabled={isSubmitting}
                          value={comment}
                          onChange={(event) => setComment(event.target.value)}
                          placeholder="Describe el motivo de la transición..."
                        />

                        <button
                          type="submit"
                          className="workflow-modal__submit"
                          disabled={
                            isSubmitting ||
                            (selectedAction?.toStatus === "APPROVED" &&
                              (isCheckingApproval ||
                                !approvalCheck?.evaluationReady))
                          }
                        >
                          {isSubmitting ? "Guardando..." : selectedAction.label}
                        </button>
                      </>
                    )}
                  </form>
                )}

                {error && (
                  <p role="alert" className="workflow-modal__error">
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

                {!historyError && history?.transitions.length === 0 && (
                  <p className="workflow-modal__muted">
                    Todavía no se han registrado transiciones para esta versión.
                  </p>
                )}

                <ol className="workflow-modal__history">
                  {history?.transitions.map((item) => (
                    <li key={item.id}>
                      <strong>
                        {workflowStatusLabels[item.fromStatus]}
                        {" → "}
                        {workflowStatusLabels[item.toStatus]}
                      </strong>

                      <span>
                        {item.performedBy.displayName}
                        {" · "}
                        {new Date(item.createdAt).toLocaleString("es-CL")}
                      </span>

                      {item.comment && <p>{item.comment}</p>}

                      {item.toStatus === "APPROVED" && (
                        <div className="workflow-modal__evidence">
                          <div className="workflow-modal__evidence-header">
                            <strong>Evidencia de aprobación</strong>
                          </div>

                          {item.evaluationId !== null &&
                          item.evaluationId !== undefined &&
                          item.evaluationScore !== null &&
                          item.evaluationScore !== undefined ? (
                            <>
                              <div className="workflow-modal__evidence-metrics">
                                <div>
                                  <span>Quality Score</span>
                                  <strong>
                                    {item.evaluationScore.toLocaleString(
                                      "es-CL",
                                      {
                                        maximumFractionDigits: 2,
                                      },
                                    )}
                                  </strong>
                                </div>

                                <div>
                                  <span>Reglas evaluadas</span>
                                  <strong>
                                    {item.evaluatedRules ?? "—"} / 18
                                  </strong>
                                </div>

                                <div>
                                  <span>Hallazgos bloqueantes</span>
                                  <strong>
                                    {item.evaluationHasBlockingIssues === false
                                      ? "No"
                                      : item.evaluationHasBlockingIssues ===
                                          true
                                        ? "Sí"
                                        : "Sin información"}
                                  </strong>
                                </div>
                              </div>

                              <div className="workflow-modal__evidence-document">
                                <span>Documento evaluado</span>
                                <code>
                                  {item.evaluatedDocumentId ?? "No disponible"}
                                </code>
                              </div>

                              <Link
                                className="workflow-modal__evidence-link"
                                to={`/app/evaluations/${encodeURIComponent(item.evaluationId)}`}
                              >
                                Ver evaluación completa
                              </Link>
                            </>
                          ) : (
                            <p className="workflow-modal__muted">
                              Esta aprobación no tiene evidencia histórica
                              vinculada.
                            </p>
                          )}
                        </div>
                      )}
                    </li>
                  ))}
                </ol>
              </section>
            </>
          )}
        </div>

        <footer className="workflow-modal__footer">
          <button type="button" onClick={onClose} disabled={isSubmitting}>
            Cerrar
          </button>
        </footer>
      </section>
    </div>
  );
}
