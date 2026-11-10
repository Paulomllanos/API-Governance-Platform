
import {
  httpRequest,
} from '../../../shared/services/http-client';

import type {
  AuditResponse,
} from '../types/audit.types';

export async function fetchAuditEvents(
  page = 1,
  limit = 20,
): Promise<AuditResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  return httpRequest<AuditResponse>(
    `/audit?${params.toString()}`,
  );
}
