import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Clock3, ClipboardCheck } from "lucide-react";

import { Card } from "../../../components/ui/Card/Card";

import {
  fetchEvaluationById,
  type BackendEvaluation,
} from "../services/evaluations.api";

import type { EvaluationStatus } from "../types/evaluation.types";

import "./EvaluationDetailPage.css";

import { EvaluationResultsFilters } from "../components/EvaluationResultsFilters";

import { EvaluationFindingsSummary } from "../components/EvaluationFindingsSummary";


import {
  QualityScoreCard,
} from "../../../components/evaluations/QualityScoreCard";

import {
  resolveQualityScore,
} from "../../../components/evaluations/resolveQualityScore";


const statusLabels: Record<EvaluationStatus, string> = {
  PENDING: "Pendiente",
  RUNNING: "En ejecución",
  COMPLETED: "Completada",
  FAILED: "Fallida",
};

function formatDate(value: string | null): string {
  if (!value) return "—";

  return new Date(value).toLocaleString("es-CL", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export function EvaluationDetailPage() {
  const { evaluationId } = useParams<{ evaluationId: string }>();

  const [evaluation, setEvaluation] = useState<BackendEvaluation | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!evaluationId) {
      setIsLoading(false);
      setLoadError("No se proporcionó una evaluación válida.");
      return;
    }

    let active = true;

    void fetchEvaluationById(evaluationId)
      .then((data) => {
        if (active) {
          setEvaluation(data);
          setLoadError(null);
        }
      })
      .catch(() => {
        if (active) {
          setLoadError("No fue posible obtener la evaluación desde NestJS.");
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
  }, [evaluationId]);

  if (isLoading) {
    return (
      <div className="evaluation-detail-page">
        <Card className="evaluation-detail__section">
          <p role="status">Cargando evaluación desde PostgreSQL...</p>
        </Card>
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="evaluation-detail-page">
        <Link to="/app/evaluations" className="evaluation-detail__back">
          <ArrowLeft size={16} />
          Volver a evaluaciones
        </Link>

        <Card className="evaluation-detail__section">
          <h1>Evaluación no encontrada</h1>
          <p>
            {loadError ??
              "No existe una evaluación con el identificador solicitado."}
          </p>
        </Card>
      </div>
    );
  }

  const document = evaluation.document;

  const version = document?.apiVersion;

  const api = version?.api;

  const results = evaluation.results ?? [];

  // Prioriza el Quality Score definitivo sobre el provisional.
  const quality = resolveQualityScore(evaluation);

  const expectedRules = evaluation.scoreAssessment?.expectedRules ?? 18;

  const isCompleted = evaluation.status === "COMPLETED";
  const isFailed = evaluation.status === "FAILED";

  const evaluatedCount =
    evaluation.passedRules +
    evaluation.failedRules +
    evaluation.warningRules +
    evaluation.notApplicableRules;

  const applicableCount =
    evaluation.passedRules + evaluation.failedRules + evaluation.warningRules;

  return (
    <div className="evaluation-detail-page">
      <Link to="/app/evaluations" className="evaluation-detail__back">
        <ArrowLeft size={16} />
        Volver a evaluaciones
      </Link>

      <header className="evaluation-detail__header">
        <div>
          <h1>Detalle de evaluación</h1>
          <p>
            {api?.name ?? "API no disponible"}
            {" · "}
            {document?.fileName ?? "Documento no disponible"}
          </p>
        </div>

        <span
          className={`evaluation-detail__status evaluation-detail__status--${evaluation.status.toLowerCase()}`}
        >
          {statusLabels[evaluation.status]}
        </span>
      </header>

      <QualityScoreCard
        score={quality.score}
        source={quality.source}
        hasBlockingIssues={quality.hasBlockingIssues}
        totalRules={evaluation.totalRules}
        passedRules={evaluation.passedRules}
        failedRules={evaluation.failedRules}
        warningRules={evaluation.warningRules}
        notApplicableRules={evaluation.notApplicableRules}
      />

      <section
        className="evaluation-detail__metrics"
        aria-label="Resumen de evaluación"
      >
        <Card className="evaluation-detail__metric">
          <span>Reglas evaluadas</span>
          <strong>{evaluatedCount}</strong>
          <small>De {expectedRules} reglas previstas en el MVP</small>
        </Card>

        <Card className="evaluation-detail__metric">
          <span>Reglas aprobadas</span>
          <strong>{evaluation.passedRules}</strong>
          <small>De {applicableCount} reglas aplicables</small>
        </Card>

        <Card className="evaluation-detail__metric">
          <span>Incumplimientos</span>
          <strong>{evaluation.failedRules}</strong>
          <small>Reglas con resultado FAIL</small>
        </Card>

        <Card className="evaluation-detail__metric">
          <span>Advertencias</span>
          <strong>{evaluation.warningRules}</strong>
          <small>Validaciones que requieren revisión</small>
        </Card>

        <Card className="evaluation-detail__metric">
          <span>No aplicables</span>
          <strong>{evaluation.notApplicableRules}</strong>
          <small>Excluidas del Quality Score</small>
        </Card>
      </section>

      {evaluation.scoreAssessment && (
        <Card className="evaluation-detail__section">
          <h2>Cobertura de gobierno</h2>

          <p>
            Se ejecutaron{" "}
            <strong>{evaluation.scoreAssessment.executedRules}</strong> de{" "}
            <strong>{evaluation.scoreAssessment.expectedRules}</strong> reglas
            previstas.
          </p>

          <progress
            value={evaluation.scoreAssessment.coveragePercentage}
            max={100}
            aria-label="Cobertura de reglas de gobierno"
          />

          <p>
            Cobertura:{" "}
            <strong>{evaluation.scoreAssessment.coveragePercentage}%</strong>
          </p>

          {quality.source === "PROVISIONAL" && (
            <p>
              Esta evaluación utiliza una puntuación provisional calculada a
              partir de resultados históricos.
            </p>
          )}
        </Card>
      )}

      <Card className="evaluation-detail__section">
        <h2>Información de la ejecución</h2>

        <div className="evaluation-detail__information">
          <div>
            <span>API</span>
            <strong>{api?.name ?? "—"}</strong>
          </div>

          <div>
            <span>Versión</span>
            <strong>{version ? `v${version.version}` : "—"}</strong>
          </div>

          <div>
            <span>Documento</span>
            <strong>{document?.fileName ?? "—"}</strong>
          </div>

          <div>
            <span>Solicitada por</span>
            <strong>{evaluation.executedBy}</strong>
          </div>

          <div>
            <span>Fecha de solicitud</span>
            <strong>{formatDate(evaluation.requestedAt)}</strong>
          </div>

          <div>
            <span>Fecha de finalización</span>
            <strong>{formatDate(evaluation.completedAt)}</strong>
          </div>
        </div>
      </Card>

      {isCompleted && results.length > 0 && (
        <EvaluationFindingsSummary results={results} />
      )}

      <Card className="evaluation-detail__section">
        <div className="evaluation-detail__section-heading">
          <h2>Resultados de reglas</h2>
          <p>Condiciones verificadas y evidencias de la ejecución.</p>
        </div>

        {!isCompleted ? (
          <div className="evaluation-detail__empty">
            {isFailed ? (
              <>
                <ClipboardCheck size={27} />
                <strong>La evaluación falló</strong>
                <p>
                  {evaluation.errorMessage ??
                    "No fue posible completar la ejecución."}
                </p>
              </>
            ) : (
              <>
                <Clock3 size={27} />
                <strong>
                  {evaluation.status === "RUNNING"
                    ? "Evaluación en ejecución"
                    : "Evaluación pendiente"}
                </strong>
                <p>
                  {evaluation.status === "RUNNING"
                    ? "La ejecución todavía no ha finalizado."
                    : "La solicitud está registrada. El motor de reglas todavía no ha procesado este documento."}
                </p>
              </>
            )}
          </div>
        ) : results.length === 0 ? (
          <div className="evaluation-detail__empty">
            <ClipboardCheck size={27} />
            <strong>Sin resultados registrados</strong>
            <p>
              La ejecución figura como completada, pero no tiene resultados
              individuales disponibles.
            </p>
          </div>
        ) : (
          <EvaluationResultsFilters results={results} />
        )}
      </Card>
    </div>
  );
}
