
import type {
  ApiAttentionStatus,
  ActivityType,
} from './dashboard.types';

export interface DashboardSummaryResponse {
  metrics: {
    totalApis: number;
    activeApis: number;
    totalEvaluations: number;
    completedEvaluations: number;
    pendingReviews: number;
    publishedVersions: number;
    averageScore: number | null;
    scoredVersions: number;
  };

  attentionApis: {
    id: string;
    apiId: string;
    name: string;
    version: string;
    score: number | null;
    findings: number;
    criticalFindings: number;
    status: ApiAttentionStatus;
  }[];

  governanceCategories: {
    id: string;
    name: string;
    score: number | null;
    applicableRules: number;
  }[];

  recentActivity: {
    id: string;
    type: ActivityType;
    title: string;
    description: string;
    time: string;
  }[];
}
