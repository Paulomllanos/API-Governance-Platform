export type MetricTone =
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'

export interface DashboardMetric {
  id: string
  label: string
  value: string
  description: string
  tone: MetricTone
}

export type ApiAttentionStatus =
  | 'critical'
  | 'correction'
  | 'review'

export interface ApiAttentionItem {
  id: string
  name: string
  version: string
  score: number
  findings: number
  criticalFindings: number
  status: ApiAttentionStatus
}

export interface GovernanceCategory {
  id: string
  name: string
  score: number
}

export type ActivityType =
  | 'evaluation'
  | 'finding'
  | 'approval'
  | 'reevaluation'

export interface DashboardActivity {
  id: string
  type: ActivityType
  title: string
  description: string
  time: string
}