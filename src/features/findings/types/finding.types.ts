
export type FindingState =
  | 'NEW'
  | 'PERSISTENT'
  | 'RESOLVED';

export type FindingStatus =
  | 'PASS'
  | 'FAIL'
  | 'WARNING';

export type FindingSeverity =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'CRITICAL';

export type FindingCategory =
  | 'DESIGN'
  | 'DOCUMENTATION'
  | 'SECURITY'
  | 'VERSIONING'
  | 'OBSERVABILITY'
  | 'GOVERNANCE';

export interface Finding {
  id: string;
  ruleId: string;
  ruleName: string | null;

  category: FindingCategory | null;
  severity: FindingSeverity | null;

  status: FindingStatus;
  state: FindingState;
  previousStatus: string | null;

  message: string;
  evidence: string | null;
  recommendation: string | null;

  apiId: string;
  apiName: string;

  versionId: string;
  version: string;

  documentId: string;
  documentName: string;

  evaluationId: string;
  evaluatedAt: string;
}

export interface FindingsSummary {
  total: number;
  new: number;
  persistent: number;
  resolved: number;
  pendingEvaluationVersions: number;
}

export interface FindingsResponse {
  summary: FindingsSummary;
  findings: Finding[];
}

export const findingStateLabels: Record<
  FindingState,
  string
> = {
  NEW: 'Nuevo',
  PERSISTENT: 'Persistente',
  RESOLVED: 'Corregido',
};
