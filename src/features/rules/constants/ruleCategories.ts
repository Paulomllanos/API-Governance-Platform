
import type { RuleCategory } from '../types/rule.types'

export const RULE_CATEGORIES: {
  id: RuleCategory
  label: string
  expectedRules: number
}[] = [
  {
    id: 'DESIGN',
    label: 'Diseño',
    expectedRules: 4,
  },
  {
    id: 'DOCUMENTATION',
    label: 'Documentación',
    expectedRules: 4,
  },
  {
    id: 'SECURITY',
    label: 'Seguridad',
    expectedRules: 3,
  },
  {
    id: 'VERSIONING',
    label: 'Versionamiento',
    expectedRules: 2,
  },
  {
    id: 'OBSERVABILITY',
    label: 'Observabilidad',
    expectedRules: 2,
  },
  {
    id: 'GOVERNANCE',
    label: 'Gobierno',
    expectedRules: 3,
  },
]

export const TOTAL_GOVERNANCE_RULES =
  RULE_CATEGORIES.reduce(
    (total, category) => total + category.expectedRules,
    0,
  )
