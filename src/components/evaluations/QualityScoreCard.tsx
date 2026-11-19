
import './QualityScoreCard.css';

import type {
  QualityScoreSource,
} from './resolveQualityScore';

export interface QualityScoreCardProps {
  score: number | null;
  source: QualityScoreSource;
  hasBlockingIssues: boolean | null;
  totalRules: number;
  passedRules: number;
  failedRules: number;
  warningRules: number;
  notApplicableRules: number;
}

function getScoreLabel(score: number): string {
  if (score >= 90) return 'Cumplimiento excelente';
  if (score >= 75) return 'Cumplimiento alto';
  if (score >= 50) return 'Cumplimiento moderado';
  return 'Cumplimiento bajo';
}

function getScoreLevel(score: number): string {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'high';
  if (score >= 50) return 'moderate';
  return 'low';
}

function formatScore(score: number): string {
  return new Intl.NumberFormat('es-CL', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(score);
}

export function QualityScoreCard({
  score,
  source,
  hasBlockingIssues,
  totalRules,
  passedRules,
  failedRules,
  warningRules,
  notApplicableRules,
}: QualityScoreCardProps) {
  const validScore =
    score !== null &&
    Number.isFinite(score) &&
    score >= 0 &&
    score <= 100
      ? score
      : null;

  const isDefinitive =
    source === 'DEFINITIVE' && validScore !== null;

  const isProvisional =
    source === 'PROVISIONAL' && validScore !== null;

  const scoreLevel =
    validScore !== null
      ? getScoreLevel(validScore)
      : 'unavailable';

  const metrics = [
    { label: 'Total', value: totalRules },
    { label: 'Aprobadas', value: passedRules },
    { label: 'Fallidas', value: failedRules },
    { label: 'Advertencias', value: warningRules },
    { label: 'No aplicables', value: notApplicableRules },
  ];

  return (
    <section
      className={`quality-score-card quality-score-card--${scoreLevel}`}
      aria-label="Resumen del Quality Score"
    >
      <div className="quality-score-card__header">
        <div className="quality-score-card__heading">
          <h2 className="quality-score-card__title">
            Quality Score
          </h2>

          <p className="quality-score-card__subtitle">
            Indicador de cumplimiento de gobierno de APIs
          </p>
        </div>

        <span
          className={`quality-score-card__badge ${
            isDefinitive
              ? 'quality-score-card__badge--definitive'
              : isProvisional
                ? 'quality-score-card__badge--provisional'
                : 'quality-score-card__badge--unavailable'
          }`}
        >
          {isDefinitive
            ? 'Definitivo'
            : isProvisional
              ? 'Provisional'
              : 'No disponible'}
        </span>
      </div>

      <div className="quality-score-card__score-section">
        <div className="quality-score-card__value-group">
          <strong className="quality-score-card__value">
            {validScore !== null
              ? formatScore(validScore)
              : '—'}
          </strong>

          {validScore !== null && (
            <span className="quality-score-card__max">
              / 100
            </span>
          )}
        </div>

        <p className="quality-score-card__level">
          {validScore !== null
            ? getScoreLabel(validScore)
            : 'No existe una puntuación calculable.'}
        </p>

        <div
          className="quality-score-card__progress"
          role="progressbar"
          aria-label="Quality Score"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={validScore ?? undefined}
          aria-valuetext={
            validScore !== null
              ? `${formatScore(validScore)} de 100`
              : 'Sin puntuación'
          }
        >
          <div
            className="quality-score-card__progress-fill"
            style={{
              width: `${validScore ?? 0}%`,
            }}
          />
        </div>
      </div>

      {isProvisional && (
        <p className="quality-score-card__notice">
          Esta puntuación es una estimación calculada
          a partir de resultados históricos y no constituye
          el Quality Score definitivo de la ejecución.
        </p>
      )}

      <div className="quality-score-card__metrics">
        {metrics.map((metric) => (
          <div
            className="quality-score-card__metric"
            key={metric.label}
          >
            <span className="quality-score-card__metric-label">
              {metric.label}
            </span>

            <strong className="quality-score-card__metric-value">
              {metric.value}
            </strong>
          </div>
        ))}
      </div>

      {isDefinitive && hasBlockingIssues === true && (
        <div
          className="quality-score-card__alert quality-score-card__alert--danger"
          role="alert"
        >
          <strong>Incumplimientos bloqueantes</strong>

          <p>
            Esta evaluación contiene al menos una regla
            de severidad HIGH o CRITICAL con estado FAIL.
          </p>
        </div>
      )}

      {isDefinitive && hasBlockingIssues === false && (
        <div className="quality-score-card__alert quality-score-card__alert--success">
          <strong>Sin incumplimientos bloqueantes</strong>

          <p>
            No se detectaron incumplimientos bloqueantes
            bajo la política de evaluación aplicada.
          </p>
        </div>
      )}
    </section>
  );
}
