
import {
  httpRequest,
} from '../../../shared/services/http-client';

import type {
  ChangeWorkflowStatusRequest,
  ChangeWorkflowStatusResponse,
  WorkflowHistory,
} from '../types/workflow.types';

function workflowEndpoint(
  apiId: string,
  versionId: string,
): string {
  return (
    `/apis/${encodeURIComponent(apiId)}` +
    `/versions/${encodeURIComponent(versionId)}` +
    '/workflow'
  );
}

export async function changeWorkflowStatusRequest(
  data: ChangeWorkflowStatusRequest,
): Promise<ChangeWorkflowStatusResponse> {
  return httpRequest<ChangeWorkflowStatusResponse>(
    workflowEndpoint(data.apiId, data.versionId),
    {
      method: 'PATCH',
      body: JSON.stringify({
        toStatus: data.toStatus,
        ...(data.comment !== undefined
          ? { comment: data.comment }
          : {}),
      }),
    },
  );
}

export async function fetchWorkflowHistory(
  apiId: string,
  versionId: string,
): Promise<WorkflowHistory> {
  return httpRequest<WorkflowHistory>(
    `${workflowEndpoint(apiId, versionId)}/history`,
  );
}
