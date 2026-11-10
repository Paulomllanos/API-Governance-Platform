
import {
  httpRequest,
} from '../../../shared/services/http-client';

import type {
  ReviewQueueResponse,
} from '../types/review.types';

export async function fetchReviewQueue():
  Promise<ReviewQueueResponse> {
  return httpRequest<ReviewQueueResponse>(
    '/reviews/queue',
  );
}
