import type {
  RuleResultStatus,
} from '../../rules/types/rule.types'

export type EvaluationStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'

export interface GovernanceExecution {
  id: string

  documentId: string
  executedBy: string

  status: EvaluationStatus

  startedAt: string
  completedAt: string | null

  qualityScore: number | null
  hasBlockingIssues: boolean | null

  totalRules: number
  passedRules: number
  failedRules: number
  warningRules: number
  notApplicableRules: number

  errorMessage: string | null
}

export interface RuleResult {
  id: string
  executionId: string
  ruleId: string

  status: RuleResultStatus

  message: string
  evidence: string | null
  recommendation: string | null
}

export interface CreateEvaluationData {
  documentId: string
}

export interface EvaluationDetail {
  execution: GovernanceExecution
  results: RuleResult[]
}
