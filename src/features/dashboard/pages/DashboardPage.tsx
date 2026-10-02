import {
  ArrowRight,
  CheckCircle2,
  FileSearch,
  Plus,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react'

import { Badge } from '../../../components/ui/Badge/Badge'
import { Button } from '../../../components/ui/Button/Button'
import { Card } from '../../../components/ui/Card/Card'

import {
  attentionApis,
  dashboardMetrics,
  governanceCategories,
  recentActivity,
} from '../../../mocks/dashboard'

import { MetricCard } from '../components/MetricCard/MetricCard'

import type {
  ApiAttentionStatus,
  ActivityType,
} from '../types/dashboard.types'

import './DashboardPage.css'

const statusConfig: Record<
  ApiAttentionStatus,
  {
    label: string
    variant: 'danger' | 'warning' | 'success'
  }
> = {
  critical: {
    label: 'Crítico',
    variant: 'danger',
  },
  correction: {
    label: 'En corrección',
    variant: 'warning',
  },
  review: {
    label: 'Listo para revisión',
    variant: 'success',
  },
}

const activityIcons: Record<
  ActivityType,
  typeof FileSearch
> = {
  evaluation: FileSearch,
  finding: ShieldAlert,
  reevaluation: RefreshCw,
  approval: CheckCircle2,
}

export function DashboardPage() {
  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <span className="dashboard-eyebrow">
            Governance Workspace
          </span>

          <h1>Buenos días, Paulo.</h1>

          <p>
            Tienes 4 APIs que requieren atención en tu
            ecosistema.
          </p>
        </div>

        <Button>
          <Plus size={17} />
          Nueva API
        </Button>
      </header>

      <section
        className="dashboard-metrics"
        aria-label="Resumen"
      >
        {dashboardMetrics.map((metric) => (
          <MetricCard
            key={metric.id}
            metric={metric}
          />
        ))}
      </section>

      <div className="dashboard-main-grid">
        <Card className="dashboard-section attention-section">
          <div className="dashboard-section-header">
            <div>
              <h2>Requieren tu atención</h2>

              <p>
                APIs con hallazgos o decisiones pendientes.
              </p>
            </div>

            <button
              type="button"
              className="dashboard-text-action"
            >
              Ver todas
              <ArrowRight size={15} />
            </button>
          </div>

          <div className="attention-list">
            {attentionApis.map((api) => {
              const status = statusConfig[api.status]

              return (
                <button
                  type="button"
                  className="attention-item"
                  key={api.id}
                >
                  <div className="attention-api">
                    <div className="attention-api-icon">
                      {api.name
                        .split(' ')
                        .map((word) => word[0])
                        .join('')
                        .slice(0, 2)}
                    </div>

                    <div>
                      <strong>{api.name}</strong>

                      <span>{api.version}</span>
                    </div>
                  </div>

                  <div className="attention-score">
                    <span>Score</span>

                    <strong>{api.score}</strong>
                  </div>

                  <div className="attention-findings">
                    <span>Hallazgos</span>

                    <strong>{api.findings}</strong>
                  </div>

                  <div className="attention-status">
                    <Badge variant={status.variant}>
                      {status.label}
                    </Badge>

                    {api.criticalFindings > 0 && (
                      <span className="attention-critical">
                        {api.criticalFindings} críticos
                      </span>
                    )}
                  </div>

                  <ArrowRight
                    className="attention-arrow"
                    size={17}
                  />
                </button>
              )
            })}
          </div>
        </Card>

        <Card className="dashboard-section governance-section">
          <div className="dashboard-section-header">
            <div>
              <h2>Estado del gobierno</h2>

              <p>Quality Score por categoría.</p>
            </div>
          </div>

          <div className="governance-categories">
            {governanceCategories.map((category) => (
              <div
                className="governance-category"
                key={category.id}
              >
                <div className="governance-category-header">
                  <span>{category.name}</span>

                  <strong>{category.score}</strong>
                </div>

                <div className="governance-progress">
                  <div
                    className="governance-progress-value"
                    style={{
                      width: `${category.score}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="dashboard-section activity-section">
        <div className="dashboard-section-header">
          <div>
            <h2>Actividad reciente</h2>

            <p>
              Últimos eventos relevantes de gobierno.
            </p>
          </div>

          <button
            type="button"
            className="dashboard-text-action"
          >
            Ver auditoría
            <ArrowRight size={15} />
          </button>
        </div>

        <div className="activity-list">
          {recentActivity.map((activity) => {
            const Icon = activityIcons[activity.type]

            return (
              <div
                className="activity-item"
                key={activity.id}
              >
                <div
                  className={`activity-icon activity-icon--${activity.type}`}
                >
                  <Icon size={17} />
                </div>

                <div className="activity-content">
                  <strong>{activity.title}</strong>

                  <span>{activity.description}</span>
                </div>

                <time>{activity.time}</time>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}