import type {
  WorkflowStatus,
} from '../../workflow/types/workflow.types';


export type ApiVersionStatus =
  | 'DRAFT'
  | 'ACTIVE'
  | 'DEPRECATED'

export interface ApiVersion {
  id: string
  apiId: string
  version: string
  description: string
  status: ApiVersionStatus
  createdAt: string
  updatedAt: string
  workflowStatus: WorkflowStatus;
}

export interface CreateApiVersionData {
  apiId: string
  version: string
  description: string
}
