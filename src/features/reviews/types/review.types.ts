
import type {
    WorkflowStatus,
} from '../../workflow/types/workflow.types';

import type {
    ApiVersionStatus,
} from '../../versions/types/version.types';

export type ReviewQueueStatus = Extract<
    WorkflowStatus,
    'IN_REVIEW' | 'OBSERVED' | 'CORRECTED' | 'APPROVED'
>;

export interface ReviewQueueEvaluation {
    id: string;
    status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
    qualityScore: number | null;
    hasBlockingIssues: boolean | null;
    totalRules: number;
    resultsCount: number;

    blockingRules: {
        id: string;
        ruleId: string;
        ruleName: string | null;
        severity: 'HIGH' | 'CRITICAL' | null;
        message: string;
        recommendation: string | null;
    }[];

}

export interface ReviewQueueItem {
    id: string;
    apiId: string;
    version: string;
    description: string;
    lifecycleStatus: ApiVersionStatus;
    workflowStatus: ReviewQueueStatus;
    updatedAt: string;

    api: {
        id: string;
        name: string;
        owner: string;
    };

    document: {
        id: string;
        fileName: string;
        isValid: boolean;
    } | null;

    evaluation: ReviewQueueEvaluation | null;
    evaluationReady: boolean;
    approvalBlockers: string[];
}

export interface ReviewQueueSummary {
    total: number;
    inReview: number;
    observed: number;
    corrected: number;
    approved: number;
}

export interface ReviewQueueResponse {
    summary: ReviewQueueSummary;
    items: ReviewQueueItem[];
}
