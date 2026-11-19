import { httpRequest } from '../../../shared/services/http-client';
import type { GovernanceRule } from '../types/rule.types';

/** La definición de las reglas pertenece al motor de NestJS. */
export function fetchGovernanceRules(): Promise<GovernanceRule[]> {
  return httpRequest<GovernanceRule[]>('/governance/rules');
}
