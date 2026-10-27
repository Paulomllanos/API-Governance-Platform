
export type WorkflowStatus =
  | 'DRAFT'
  | 'IN_REVIEW'
  | 'OBSERVED'
  | 'CORRECTED'
  | 'APPROVED'
  | 'PUBLISHED';

export const workflowStatusLabels: Record<
  WorkflowStatus,
  string
> = {
  DRAFT: 'Borrador',
  IN_REVIEW: 'En revisión',
  OBSERVED: 'Observado',
  CORRECTED: 'Corregido',
  APPROVED: 'Aprobado',
  PUBLISHED: 'Publicado',
};

export interface WorkflowTransition {
  id: string;
  fromStatus: WorkflowStatus;
  toStatus: WorkflowStatus;
  comment: string | null;
  createdAt: string;
  performedBy: {
    id: string;
    displayName: string;
    email: string;
  };
  
  evaluationId: string | null;
  evaluatedDocumentId: string | null;
  evaluationScore: number | null;
  evaluatedRules: number | null;
  evaluationHasBlockingIssues: boolean | null;

}

export interface WorkflowHistory {
  versionId: string;
  version: string;
  currentStatus: WorkflowStatus;
  totalTransitions: number;
  transitions: WorkflowTransition[];
}

export interface ChangeWorkflowStatusRequest {
  apiId: string;
  versionId: string;
  toStatus: WorkflowStatus;
  comment?: string;
}

export interface ChangeWorkflowStatusResponse {
  versionId: string;
  previousStatus: WorkflowStatus;
  currentStatus: WorkflowStatus;
  transition: WorkflowTransition;
}
