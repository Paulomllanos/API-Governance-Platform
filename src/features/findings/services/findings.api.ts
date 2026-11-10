
import {
  httpRequest,
} from '../../../shared/services/http-client';

import type {
  FindingsResponse,
} from '../types/finding.types';

export async function fetchFindings():
  Promise<FindingsResponse> {
  return httpRequest<FindingsResponse>('/findings');
}
