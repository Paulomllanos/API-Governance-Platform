import {
  Activity,
  AlertCircle,
  Boxes,
  Gauge,
} from 'lucide-react'

import { Card } from '../../../../components/ui/Card/Card'
import type {
  DashboardMetric,
} from '../../types/dashboard.types'

import './MetricCard.css'

interface MetricCardProps {
  metric: DashboardMetric
}

const metricIcons = {
  apis: Boxes,
  evaluations: Activity,
  pending: AlertCircle,
  score: Gauge,
}

export function MetricCard({
  metric,
}: MetricCardProps) {
  const Icon =
    metricIcons[metric.id as keyof typeof metricIcons] ??
    Activity

  return (
    <Card className="metric-card">
      <div
        className={`metric-card-icon metric-card-icon--${metric.tone}`}
      >
        <Icon size={18} strokeWidth={1.8} />
      </div>

      <div className="metric-card-content">
        <span className="metric-card-label">
          {metric.label}
        </span>

        <strong className="metric-card-value">
          {metric.value}
          {metric.id === 'score' && (
            <small>/100</small>
          )}
        </strong>

        <span className="metric-card-description">
          {metric.description}
        </span>
      </div>
    </Card>
  )
}