import { RULE_CATEGORIES, TOTAL_GOVERNANCE_RULES } from '../constants/ruleCategories';
import type { GovernanceRule } from '../types/rule.types';

/**
 * Verifica que el catálogo recibido del backend coincide con el alcance
 * comprometido para el MVP: 18 reglas únicas en seis categorías.
 * No usa ni duplica definiciones locales de reglas.
 */
export function validateRuleCatalog(rules: readonly GovernanceRule[]): boolean {
  if (!Array.isArray(rules) || rules.length !== TOTAL_GOVERNANCE_RULES) {
    return false;
  }

  const codes = rules.map((rule) => rule.code);

  if (new Set(codes).size !== rules.length) {
    return false;
  }

  if (
    rules.some(
      (rule) =>
        !rule.id ||
        rule.id !== rule.code ||
        !rule.name?.trim() ||
        !rule.description?.trim() ||
        !Number.isFinite(rule.weight) ||
        rule.weight <= 0 ||
        !['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(rule.severity) ||
        !rule.enabled ||
        rule.blocking !==
          (rule.severity === 'HIGH' || rule.severity === 'CRITICAL'),
    )
  ) {
    return false;
  }

  return RULE_CATEGORIES.every(
    (category) =>
      rules.filter((rule) => rule.category === category.id).length ===
      category.expectedRules,
  );
}
