import { describe, expect, it, vi } from 'vitest';

vi.mock('../../../shared/services/http-client', () => ({
  httpRequest: vi.fn().mockResolvedValue([
    {
      id: 'DESIGN-002',
      code: 'DESIGN-002',
      name: 'Declaración de parámetros de ruta',
      description: 'Los parámetros de URL deben declararse con in: path y required: true.',
      category: 'DESIGN',
      severity: 'HIGH',
      weight: 1,
      enabled: true,
      blocking: true,
    },
  ]),
}));

import { httpRequest } from '../../../shared/services/http-client';
import { fetchGovernanceRules } from './rules.api';

describe('Catálogo de reglas de gobierno', () => {
  it('consulta las reglas vigentes del backend, sin depender de una copia estática', async () => {
    const rules = await fetchGovernanceRules();

    expect(httpRequest).toHaveBeenCalledWith('/governance/rules');
    expect(rules[0]).toMatchObject({
      id: 'DESIGN-002',
      code: 'DESIGN-002',
      name: 'Declaración de parámetros de ruta',
      severity: 'HIGH',
      blocking: true,
    });
  });
});
