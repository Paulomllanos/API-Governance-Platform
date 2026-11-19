export type RuleCategory =
  | 'DESIGN'
  | 'DOCUMENTATION'
  | 'SECURITY'
  | 'VERSIONING'
  | 'OBSERVABILITY'
  | 'GOVERNANCE';

export type RuleSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type RuleResultStatus =
  | 'PASS'
  | 'FAIL'
  | 'WARNING'
  | 'NOT_APPLICABLE';

/** Campos públicos expuestos por el catálogo real del backend. */
export interface GovernanceRule {
  id: string;
  code: string;
  name: string;
  description: string;
  category: RuleCategory;
  severity: RuleSeverity;
  weight: number;
  enabled: boolean;
  blocking: boolean;
}

export interface GovernanceRuleResult {
  id: string;
  executionId: string;
  ruleId: string;
  status: RuleResultStatus;
  message: string;
  evidence: string | null;
  evaluatedAt: string;
}
