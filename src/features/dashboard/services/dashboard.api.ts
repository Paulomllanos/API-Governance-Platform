
import {
  httpRequest,
} from '../../../shared/services/http-client';

import type {
  DashboardSummaryResponse,
} from '../types/dashboard-response.types';

export async function fetchDashboardSummary():
  Promise<DashboardSummaryResponse> {
  return httpRequest<DashboardSummaryResponse>(
    '/dashboard/summary',
  );
}
