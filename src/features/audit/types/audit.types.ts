
import type {
  WorkflowStatus,
} from '../../workflow/types/workflow.types';

export interface AuditApprovalEvidence {
  evaluationId: string | null;
  documentId: string | null;
  qualityScore: number | null;
  evaluatedRules: number | null;
  hasBlockingIssues: boolean | null;
}

export interface AuditEvent {
  id: string;

  api: {
    id: string;
    name: string;
    owner: string;
  };

  version: {
    id: string;
    number: string;
  };

  fromStatus: WorkflowStatus;
  toStatus: WorkflowStatus;

  comment: string | null;
  createdAt: string;

  performedBy: {
    id: string;
    displayName: string;
    email: string;
  };

  approvalEvidence: AuditApprovalEvidence | null;
}

export interface AuditSummary {
  total: number;
  approvals: number;
  publications: number;
  observations: number;
}

export interface AuditPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AuditResponse {
  summary: AuditSummary;
  pagination: AuditPagination;
  items: AuditEvent[];
}
