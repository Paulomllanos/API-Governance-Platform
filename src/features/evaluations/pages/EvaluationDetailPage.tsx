
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Clock3, ClipboardCheck } from 'lucide-react'

import { Card } from '../../../components/ui/Card/Card'
import { useApis } from '../../apis/hooks/useApis'
import { GOVERNANCE_RULES } from '../../rules/constants/governanceRules'

import type {
  EvaluationStatus,
} from '../types/evaluation.types'

import './EvaluationDetailPage.css'

const statusLabels: Record<EvaluationStatus, string> = {
  PENDING: 'Pendiente',
  RUNNING: 'En ejecución',
  COMPLETED: 'Completada',
  FAILED: 'Fallida',
}

function formatDate(value: string | null): string {
  if (!value) return '—'

  return new Date(value).toLocaleString('es-CL', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

export function EvaluationDetailPage() {
  const { evaluationId } = useParams<{ evaluationId: string }>()

  const {
    evaluations,
    ruleResults,
    documents,
    versions,
    apis,
  } = useApis()

  const evaluation = evaluations.find(
    (item) => item.id === evaluationId,
  )

  if (!evaluation) {
    return (
      <div className="evaluation-detail-page">
        <Link
          to="/app/evaluations"
          className="evaluation-detail__back"
        >
          <ArrowLeft size={16} />
          Volver a evaluaciones
        </Link>

        <Card className="evaluation-detail__section">
          <h1>Evaluación no encontrada</h1>
          <p>
            No existe una evaluación con el identificador solicitado.
          </p>
        </Card>
      </div>
    )
  }

  const document = documents.find(
    (item) => item.id === evaluation.documentId,
  )

  const version = versions.find(
    (item) => item.id === document?.versionId,
  )

  const api = apis.find(
    (item) => item.id === version?.apiId,
  )

  const results = ruleResults.filter(
    (item) => item.executionId === evaluation.id,
  )

  const isCompleted = evaluation.status === 'COMPLETED'
  const isFailed = evaluation.status === 'FAILED'

  const evaluatedCount =
    evaluation.passedRules +
    evaluation.failedRules +
    evaluation.warningRules +
    evaluation.notApplicableRules

  return (
    <div className="evaluation-detail-page">
      <Link
        to="/app/evaluations"
        className="evaluation-detail__back"
      >
        <ArrowLeft size={16} />
        Volver a evaluaciones
      </Link>

      <header className="evaluation-detail__header">
        <div>
          <h1>Detalle de evaluación</h1>
          <p>
            {api?.name ?? 'API no disponible'}
            {' · '}
            {document?.fileName ?? 'Documento no disponible'}
          </p>
        </div>

        <span
          className={`evaluation-detail__status evaluation-detail__status--${evaluation.status.toLowerCase()}`}
        >
          {statusLabels[evaluation.status]}
        </span>
      </header>

      <section
        className="evaluation-detail__metrics"
        aria-label="Resumen de evaluación"
      >
        <Card className="evaluation-detail__metric">
          <span>Quality Score</span>
          <strong>
            {isCompleted && evaluation.qualityScore !== null
              ? `${evaluation.qualityScore}/100`
              : '—'}
          </strong>
          <small>
            {isCompleted
              ? 'Resultado de la ejecución'
              : 'Sin puntuación disponible'}
          </small>
        </Card>

        <Card className="evaluation-detail__metric">
          <span>Reglas evaluadas</span>
          <strong>{evaluatedCount}</strong>
          <small>
            De {GOVERNANCE_RULES.length} reglas previstas
          </small>
        </Card>
      </section>

      <Card className="evaluation-detail__section">
        <h2>Información de la ejecución</h2>

        <div className="evaluation-detail__information">
          <div>
            <span>API</span>
            <strong>{api?.name ?? '—'}</strong>
          </div>

          <div>
            <span>Versión</span>
            <strong>
              {version ? `v${version.version}` : '—'}
            </strong>
          </div>

          <div>
            <span>Documento</span>
            <strong>{document?.fileName ?? '—'}</strong>
          </div>

          <div>
            <span>Solicitada por</span>
            <strong>{evaluation.executedBy}</strong>
          </div>

          <div>
            <span>Fecha de solicitud</span>
            <strong>{formatDate(evaluation.startedAt)}</strong>
          </div>

          <div>
            <span>Fecha de finalización</span>
            <strong>{formatDate(evaluation.completedAt)}</strong>
          </div>
        </div>
      </Card>

      <Card className="evaluation-detail__section">
        <div className="evaluation-detail__section-heading">
          <h2>Resultados de reglas</h2>
          <p>
            Condiciones verificadas y evidencias de la ejecución.
          </p>
        </div>

        {!isCompleted ? (
          <div className="evaluation-detail__empty">
            {isFailed ? (
              <>
                <ClipboardCheck size={27} />
                <strong>La evaluación falló</strong>
                <p>
                  {evaluation.errorMessage ??
                    'No fue posible completar la ejecución.'}
                </p>
              </>
            ) : (
              <>
                <Clock3 size={27} />
                <strong>
                  {evaluation.status === 'RUNNING'
                    ? 'Evaluación en ejecución'
                    : 'Evaluación pendiente'}
                </strong>
                <p>
                  {evaluation.status === 'RUNNING'
                    ? 'La ejecución todavía no ha finalizado.'
                    : 'La solicitud está registrada. El motor de reglas todavía no ha procesado este documento.'}
                </p>
              </>
            )}
          </div>
        ) : results.length === 0 ? (
          <div className="evaluation-detail__empty">
            <ClipboardCheck size={27} />
            <strong>Sin resultados registrados</strong>
            <p>
              La ejecución figura como completada, pero no tiene
              resultados individuales disponibles.
            </p>
          </div>
        ) : (
          <div className="evaluation-detail__table-scroll">
            <table className="evaluation-detail__table">
              <thead>
                <tr>
                  <th>Regla</th>
                  <th>Resultado</th>
                  <th>Mensaje</th>
                  <th>Evidencia</th>
                </tr>
              </thead>

              <tbody>
                {results.map((result) => {
                  const rule = GOVERNANCE_RULES.find(
                    (item) => item.id === result.ruleId,
                  )

                  return (
                    <tr key={result.id}>
                      <td>
                        <strong>
                          {rule?.code ?? result.ruleId}
                        </strong>
                        <small>{rule?.name ?? 'Regla no disponible'}</small>
                      </td>

                      <td>
                        <span
                          className={`evaluation-detail__result evaluation-detail__result--${result.status.toLowerCase()}`}
                        >
                          {result.status}
                        </span>
                      </td>

                      <td>{result.message}</td>
                      <td>{result.evidence ?? '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
