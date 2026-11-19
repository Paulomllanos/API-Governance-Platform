
import {
  httpRequest,
} from '../../../shared/services/http-client';

import type {
  ChangeWorkflowStatusRequest,
  ChangeWorkflowStatusResponse,
  WorkflowHistory,
} from '../types/workflow.types';

import type {
  WorkflowApprovalCheck,
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


interface ReviewQueueApprovalItem
  extends WorkflowApprovalCheck {
  id: string;
  apiId: string;
}

interface ReviewQueueApprovalResponse {
  items: ReviewQueueApprovalItem[];
}

export async function fetchWorkflowApprovalCheck(
  apiId: string,
  versionId: string,
): Promise<WorkflowApprovalCheck> {
  const response =
    await httpRequest<ReviewQueueApprovalResponse>(
      '/reviews/queue',
    );

  const item = response.items.find(
    (candidate) =>
      candidate.id === versionId &&
      candidate.apiId === apiId,
  );

  if (!item) {
    throw new Error(
      'La versión no está disponible para verificar su aprobación.',
    );
  }

  return {
    evaluationReady: item.evaluationReady,
    approvalBlockers: item.approvalBlockers,
    evaluation: item.evaluation,
  };
}
