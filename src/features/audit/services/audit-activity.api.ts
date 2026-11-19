import { httpRequest } from '../../../shared/services/http-client';

export interface OperationalAuditEvent {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  apiId: string | null;
  createdAt: string;
  detail: unknown;
  actor: {
    id: string;
    displayName: string;
    email: string;
  } | null;
}

export interface OperationalAuditResponse {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  items: OperationalAuditEvent[];
}

export function fetchOperationalAudit(page = 1): Promise<OperationalAuditResponse> {
  return httpRequest<OperationalAuditResponse>(
    `/audit/activity?page=${encodeURIComponent(String(page))}&limit=20`,
  );
}
