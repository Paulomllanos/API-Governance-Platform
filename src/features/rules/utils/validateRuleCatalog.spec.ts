import { describe, expect, it } from 'vitest';
import type { GovernanceRule } from '../types/rule.types';
import { validateRuleCatalog } from './validateRuleCatalog';

function makeRules(): GovernanceRule[] {
  const entries = [
    ['DESIGN', 4],
    ['DOCUMENTATION', 4],
    ['SECURITY', 3],
    ['VERSIONING', 2],
    ['OBSERVABILITY', 2],
    ['GOVERNANCE', 3],
  ] as const;

  return entries.flatMap(([category, count]) =>
    Array.from({ length: count }, (_, i): GovernanceRule => ({
      id: `${category}-${String(i + 1).padStart(3, '0')}`,
      code: `${category}-${String(i + 1).padStart(3, '0')}`,
      name: `Regla ${i + 1}`,
      description: 'Regla de evaluación activa',
      category,
      severity: 'MEDIUM',
      weight: 1,
      enabled: true,
      blocking: false,
    })),
  );
}

describe('validateRuleCatalog', () => {
  it('acepta 18 reglas válidas distribuidas en seis categorías', () => {
    expect(validateRuleCatalog(makeRules())).toBe(true);
  });

  it('rechaza códigos duplicados', () => {
    const rules = makeRules();
    rules[1].id = rules[0].id;
    rules[1].code = rules[0].code;
    expect(validateRuleCatalog(rules)).toBe(false);
  });

  it('rechaza categorías incompletas y cardinalidad incorrecta', () => {
    expect(validateRuleCatalog(makeRules().slice(1))).toBe(false);
  });

  it('rechaza inconsistencias de severidad y estado bloqueante', () => {
    const rules = makeRules();
    rules[0].severity = 'HIGH';
    expect(validateRuleCatalog(rules)).toBe(false);
    rules[0].blocking = true;
    expect(validateRuleCatalog(rules)).toBe(true);
  });
});
