
export type RuleCategory =
  | 'DESIGN'
  | 'DOCUMENTATION'
  | 'SECURITY'
  | 'VERSIONING'
  | 'OBSERVABILITY'
  | 'GOVERNANCE'

export type RuleSeverity =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'CRITICAL'

export type RuleResultStatus =
  | 'PASS'
  | 'FAIL'
  | 'WARNING'
  | 'NOT_APPLICABLE'

export interface GovernanceRule {
  id: string
  code: string
  name: string
  description: string
  category: RuleCategory

  severity: RuleSeverity
  enabled: boolean
  blocking: boolean

  evaluationCondition: string
  applicabilityCriteria: string
  expectedResult: string
  evidenceDescription: string
}

export interface GovernanceRuleResult {
  id: string
  executionId: string
  ruleId: string

  status: RuleResultStatus
  message: string
  evidence: string | null

  evaluatedAt: string
}
