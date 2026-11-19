
import type {
  BackendRuleResult,
} from '../services/evaluations.api'

import './EvaluationFindingsSummary.css'

type Severity = NonNullable<BackendRuleResult['severity']>

const priorityOrder: Record<Severity, number> = {
  CRITICAL: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
}

const priorityLabels: Record<Severity, string> = {
  CRITICAL: 'P1 — Crítica',
  HIGH: 'P2 — Alta',
  MEDIUM: 'P3 — Media',
  LOW: 'P4 — Baja',
}

interface EvaluationFindingsSummaryProps {
  results: BackendRuleResult[]
}

export function EvaluationFindingsSummary({
  results,
}: EvaluationFindingsSummaryProps) {
  const failedResults = results.filter(
    (result) => result.status === 'FAIL',
  )

  const criticalCount = failedResults.filter(
    (result) => result.severity === 'CRITICAL',
  ).length

  const highCount = failedResults.filter(
    (result) => result.severity === 'HIGH',
  ).length

  const mediumCount = failedResults.filter(
    (result) => result.severity === 'MEDIUM',
  ).length

  const lowCount = failedResults.filter(
    (result) => result.severity === 'LOW',
  ).length

  const unknownCount = failedResults.filter(
    (result) => result.severity === null,
  ).length

  const warningCount = results.filter(
    (result) => result.status === 'WARNING',
  ).length

  const prioritizedFindings = [...failedResults].sort(
    (a, b) => {
      const priorityA = a.severity
        ? priorityOrder[a.severity]
        : 0

      const priorityB = b.severity
        ? priorityOrder[b.severity]
        : 0

      return priorityB - priorityA
    },
  )

  return (
    <section
      className="evaluation-findings"
      aria-labelledby="evaluation-findings-title"
    >
      <div className="evaluation-findings__header">
        <div>
          <h2 id="evaluation-findings-title">
            Resumen de hallazgos
          </h2>

          <p>
            Clasificación de incumplimientos según
            su severidad registrada.
          </p>
        </div>

        <strong>
          {failedResults.length} incumplimiento(s)
        </strong>
      </div>

      <div className="evaluation-findings__metrics">
        <div className="evaluation-findings__metric">
          <span>Críticos</span>
          <strong>{criticalCount}</strong>
        </div>

        <div className="evaluation-findings__metric">
          <span>Altos</span>
          <strong>{highCount}</strong>
        </div>

        <div className="evaluation-findings__metric">
          <span>Medios</span>
          <strong>{mediumCount}</strong>
        </div>

        <div className="evaluation-findings__metric">
          <span>Bajos</span>
          <strong>{lowCount}</strong>
        </div>
      </div>

      {unknownCount > 0 && (
        <p className="evaluation-findings__notice">
          {unknownCount} incumplimiento(s) no tienen
          severidad histórica registrada.
        </p>
      )}

      {warningCount > 0 && (
        <p className="evaluation-findings__notice">
          Además existen {warningCount} advertencia(s)
          que requieren revisión.
        </p>
      )}

      <div className="evaluation-findings__priority">
        <h3>Hallazgos prioritarios</h3>

        {prioritizedFindings.length === 0 ? (
          <p>
            No se detectaron incumplimientos en las
            reglas ejecutadas.
          </p>
        ) : (
          <div className="evaluation-findings__list">
            {prioritizedFindings.map((finding) => (
              <article
                key={finding.id}
                className="evaluation-findings__item"
              >
                <div className="evaluation-findings__item-header">
                  <strong>
                    {finding.ruleId}
                    {finding.ruleName
                      ? ` — ${finding.ruleName}`
                      : ''}
                  </strong>

                  <span>
                    {finding.severity
                      ? priorityLabels[finding.severity]
                      : 'Prioridad no determinada'}
                  </span>
                </div>

                <p>{finding.message}</p>

                {finding.recommendation && (
                  <div className="evaluation-findings__recommendation">
                    <strong>Recomendación</strong>
                    <p>{finding.recommendation}</p>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
