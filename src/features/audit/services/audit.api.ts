
import {
  httpRequest,
} from '../../../shared/services/http-client';

import type {
  AuditResponse,
} from '../types/audit.types';

export interface AuditQuery {
  page?: number;
  limit?: number;
  search?: string;
  api?: string;
  user?: string;
  status?: string;
  from?: string;
  to?: string;
}

export async function fetchAuditEvents(
  query: AuditQuery = {},
): Promise<AuditResponse> {
  const params = new URLSearchParams({
    page: String(query.page ?? 1),
    limit: String(query.limit ?? 20),
  });

  const filters = {
    search: query.search,
    api: query.api,
    user: query.user,
    status: query.status,
    from: query.from,
    to: query.to,
  };

  Object.entries(filters).forEach(([key, value]) => {
    if (value?.trim()) {
      params.set(key, value.trim());
    }
  });

  return httpRequest<AuditResponse>(
    `/audit?${params.toString()}`,
  );
}
