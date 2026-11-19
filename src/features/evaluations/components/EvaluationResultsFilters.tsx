
import { useMemo, useState } from 'react'

import type {
  BackendRuleResult,
} from '../services/evaluations.api'

import './EvaluationResultsFilters.css'

type Category =
  | 'DESIGN'
  | 'DOCUMENTATION'
  | 'SECURITY'
  | 'VERSIONING'
  | 'OBSERVABILITY'
  | 'GOVERNANCE'

type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

type ResultStatus =
  | 'PASS'
  | 'FAIL'
  | 'WARNING'
  | 'NOT_APPLICABLE'

const categoryLabels: Record<Category, string> = {
  DESIGN: 'Diseño',
  DOCUMENTATION: 'Documentación',
  SECURITY: 'Seguridad',
  VERSIONING: 'Versionamiento',
  OBSERVABILITY: 'Observabilidad',
  GOVERNANCE: 'Gobierno',
}

const severityOrder: Record<Severity, number> = {
  CRITICAL: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
}

const statusOrder: Record<ResultStatus, number> = {
  FAIL: 4,
  WARNING: 3,
  PASS: 2,
  NOT_APPLICABLE: 1,
}

interface EvaluationResultsFiltersProps {
  results: BackendRuleResult[]
}

export function EvaluationResultsFilters({
  results,
}: EvaluationResultsFiltersProps) {
  const [category, setCategory] = useState<Category | 'ALL'>(
    'ALL',
  )

  const [severity, setSeverity] = useState<Severity | 'ALL'>(
    'ALL',
  )

  const [status, setStatus] = useState<ResultStatus | 'ALL'>(
    'ALL',
  )

  const filteredResults = useMemo(() => {
    return results
      .filter(
        (result) =>
          category === 'ALL' || result.category === category,
      )
      .filter(
        (result) =>
          severity === 'ALL' || result.severity === severity,
      )
      .filter(
        (result) =>
          status === 'ALL' || result.status === status,
      )
      .sort((a, b) => {
        const statusDifference =
          statusOrder[b.status] - statusOrder[a.status]

        if (statusDifference !== 0) {
          return statusDifference
        }

        const severityA = a.severity
          ? severityOrder[a.severity]
          : 0

        const severityB = b.severity
          ? severityOrder[b.severity]
          : 0

        return severityB - severityA
      })
  }, [results, category, severity, status])

  return (
    <div className="evaluation-filters">
      <div className="evaluation-filters__controls">
        <label>
          Categoría
          <select
            value={category}
            onChange={(event) =>
              setCategory(
                event.target.value as Category | 'ALL',
              )
            }
          >
            <option value="ALL">Todas</option>

            {Object.entries(categoryLabels).map(
              ([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ),
            )}
          </select>
        </label>

        <label>
          Severidad
          <select
            value={severity}
            onChange={(event) =>
              setSeverity(
                event.target.value as Severity | 'ALL',
              )
            }
          >
            <option value="ALL">Todas</option>
            <option value="CRITICAL">Crítica</option>
            <option value="HIGH">Alta</option>
            <option value="MEDIUM">Media</option>
            <option value="LOW">Baja</option>
          </select>
        </label>

        <label>
          Resultado
          <select
            value={status}
            onChange={(event) =>
              setStatus(
                event.target.value as ResultStatus | 'ALL',
              )
            }
          >
            <option value="ALL">Todos</option>
            <option value="FAIL">Incumplimiento</option>
            <option value="WARNING">Advertencia</option>
            <option value="PASS">Cumple</option>
            <option value="NOT_APPLICABLE">
              No aplicable
            </option>
          </select>
        </label>
      </div>

      <p className="evaluation-filters__count">
        Mostrando {filteredResults.length} de {results.length} reglas
      </p>

      {filteredResults.length === 0 ? (
        <p role="status">
          No hay resultados que coincidan con los filtros.
        </p>
      ) : (
        <div className="evaluation-detail__table-scroll">
          <table className="evaluation-detail__table">
            <thead>
              <tr>
                <th>Regla</th>
                <th>Categoría</th>
                <th>Severidad</th>
                <th>Resultado</th>
                <th>Hallazgo</th>
                <th>Evidencia</th>
                <th>Recomendación</th>
              </tr>
            </thead>

            <tbody>
              {filteredResults.map((result) => (
                <tr key={result.id}>
                  <td>
                    <strong>{result.ruleId}</strong>
                    <small>
                      {result.ruleName ??
                        'Nombre histórico no disponible'}
                    </small>
                  </td>

                  <td>
                    {result.category
                      ? categoryLabels[result.category]
                      : 'No registrada'}
                  </td>

                  <td>
                    {result.severity ?? 'No registrada'}
                  </td>

                  <td>
                    <span
                      className={
                        `evaluation-detail__result ` +
                        `evaluation-detail__result--${result.status.toLowerCase()}`
                      }
                    >
                      {result.status}
                    </span>
                  </td>

                  <td>{result.message}</td>

                  <td>
                    {result.evidence ? (
                      <pre className="evaluation-detail__evidence">
                        {result.evidence}
                      </pre>
                    ) : (
                      '—'
                    )}
                  </td>

                  <td>
                    {result.recommendation ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
