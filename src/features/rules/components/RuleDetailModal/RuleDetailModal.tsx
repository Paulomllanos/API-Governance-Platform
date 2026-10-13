
import { useEffect, useRef } from 'react'
import { X, ShieldCheck, AlertTriangle } from 'lucide-react'

import type {
  GovernanceRule,
  RuleSeverity,
} from '../../types/rule.types'

import { RULE_CATEGORIES } from '../../constants/ruleCategories'

import './RuleDetailModal.css'

interface RuleDetailModalProps {
  rule: GovernanceRule
  onClose: () => void
}

const severityLabels: Record<RuleSeverity, string> = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  CRITICAL: 'Crítica',
}

export function RuleDetailModal({
  rule,
  onClose,
}: RuleDetailModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const category = RULE_CATEGORIES.find(
    (item) => item.id === rule.category,
  )

  useEffect(() => {
    closeButtonRef.current?.focus()
  }, [])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  return (
    <div className="rule-detail-overlay">
      <div
        className="rule-detail-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rule-detail-title"
        aria-describedby="rule-detail-description"
      >
        <header className="rule-detail__header">
          <div>
            <span className="rule-detail__code">
              {rule.code}
            </span>

            <h2 id="rule-detail-title">
              {rule.name}
            </h2>

            <p id="rule-detail-description">
              Ficha técnica de la regla de gobierno.
            </p>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            className="rule-detail__close"
            onClick={onClose}
            aria-label="Cerrar detalle de regla"
          >
            <X size={20} />
          </button>
        </header>

        <div className="rule-detail__body">
          <div className="rule-detail__summary">
            <div>
              <span>Categoría</span>
              <strong>
                {category?.label ?? rule.category}
              </strong>
            </div>

            <div>
              <span>Severidad</span>
              <strong>
                {severityLabels[rule.severity]}
              </strong>
            </div>

            <div>
              <span>Estado</span>
              <strong>
                {rule.enabled
                  ? 'Habilitada'
                  : 'Deshabilitada'}
              </strong>
            </div>
          </div>

          {rule.blocking && (
            <div className="rule-detail__warning">
              <AlertTriangle size={18} />

              <p>
                <strong>Regla bloqueante.</strong> Si esta
                regla resulta aplicable y detecta un
                incumplimiento, impedirá la aprobación
                de la especificación, independientemente
                del Quality Score.
              </p>
            </div>
          )}

          <section className="rule-detail__section">
            <h3>
              <ShieldCheck size={17} />
              Condición de evaluación
            </h3>

            <p>{rule.evaluationCondition}</p>
          </section>

          <section className="rule-detail__section">
            <h3>Criterio de aplicabilidad</h3>
            <p>{rule.applicabilityCriteria}</p>
          </section>

          <section className="rule-detail__section">
            <h3>Resultado esperado</h3>
            <p>{rule.expectedResult}</p>
          </section>

          <section className="rule-detail__section">
            <h3>Evidencia generada</h3>
            <p>{rule.evidenceDescription}</p>
          </section>

          <div className="rule-detail__notice">
            Esta ficha describe los criterios definidos
            para el MVP. La ejecución automática de la regla
            será responsabilidad del motor de evaluación.
          </div>
        </div>

        <footer className="rule-detail__footer">
          <button type="button" onClick={onClose}>
            Cerrar
          </button>
        </footer>
      </div>
    </div>
  )
}
