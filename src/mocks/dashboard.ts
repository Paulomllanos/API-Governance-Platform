import type {
  ApiAttentionItem,
  DashboardActivity,
  DashboardMetric,
  GovernanceCategory,
} from '../features/dashboard/types/dashboard.types'

export const dashboardMetrics: DashboardMetric[] = [
  {
    id: 'apis',
    label: 'APIs registradas',
    value: '12',
    description: '+2 este mes',
    tone: 'primary',
  },
  {
    id: 'evaluations',
    label: 'Evaluaciones',
    value: '34',
    description: '+6 este mes',
    tone: 'success',
  },
  {
    id: 'pending',
    label: 'Pendientes',
    value: '4',
    description: 'Requieren decisión',
    tone: 'warning',
  },
  {
    id: 'score',
    label: 'Quality Score promedio',
    value: '82',
    description: '+6 puntos este mes',
    tone: 'success',
  },
]

export const attentionApis: ApiAttentionItem[] = [
  {
    id: 'payments-api',
    name: 'Payments API',
    version: 'v1.0',
    score: 61,
    findings: 8,
    criticalFindings: 2,
    status: 'critical',
  },
  {
    id: 'orders-api',
    name: 'Orders API',
    version: 'v1.3',
    score: 74,
    findings: 5,
    criticalFindings: 0,
    status: 'correction',
  },
  {
    id: 'customers-api',
    name: 'Customers API',
    version: 'v2.0',
    score: 92,
    findings: 1,
    criticalFindings: 0,
    status: 'review',
  },
]

export const governanceCategories: GovernanceCategory[] = [
  {
    id: 'security',
    name: 'Seguridad',
    score: 88,
  },
  {
    id: 'design',
    name: 'Diseño',
    score: 84,
  },
  {
    id: 'documentation',
    name: 'Documentación',
    score: 76,
  },
  {
    id: 'versioning',
    name: 'Versionado',
    score: 91,
  },
  {
    id: 'observability',
    name: 'Observabilidad',
    score: 69,
  },
  {
    id: 'governance',
    name: 'Gobierno',
    score: 86,
  },
]

export const recentActivity: DashboardActivity[] = [
  {
    id: 'activity-1',
    type: 'evaluation',
    title: 'Evaluación completada',
    description: 'Customers API v2.0 obtuvo un Quality Score de 92.',
    time: 'Hace 12 min',
  },
  {
    id: 'activity-2',
    type: 'finding',
    title: 'Hallazgo crítico detectado',
    description: 'Payments API v1.0 presenta un incumplimiento de seguridad.',
    time: 'Hace 38 min',
  },
  {
    id: 'activity-3',
    type: 'reevaluation',
    title: 'API reevaluada',
    description: 'Orders API v1.3 fue procesada nuevamente.',
    time: 'Hace 1 h',
  },
  {
    id: 'activity-4',
    type: 'approval',
    title: 'API aprobada',
    description: 'Catalog API v1.2 completó el proceso de revisión.',
    time: 'Hace 3 h',
  },
]