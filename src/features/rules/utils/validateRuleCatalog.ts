
import { RULE_CATEGORIES } from '../constants/ruleCategories'
import { GOVERNANCE_RULES } from '../constants/governanceRules'

export function validateRuleCatalog(): boolean {
  const codes = GOVERNANCE_RULES.map((rule) => rule.code)

  const uniqueCodes = new Set(codes)

  if (uniqueCodes.size !== codes.length) {
    return false
  }

  return RULE_CATEGORIES.every((category) => {
    const count = GOVERNANCE_RULES.filter(
      (rule) => rule.category === category.id,
    ).length

    return count === category.expectedRules
  })
}
