
import type {
  GovernanceRule,
  RuleCategory,
  RuleSeverity,
} from '../types/rule.types'

interface RuleDefinition {
  code: string
  name: string
  category: RuleCategory
  severity: RuleSeverity
  condition: string
  applicability: string
  evidence: string
  blocking?: boolean
}

function defineRule(
  definition: RuleDefinition,
): GovernanceRule {
  return {
    id: definition.code,
    code: definition.code,
    name: definition.name,
    description: definition.condition,
    category: definition.category,
    severity: definition.severity,
    enabled: true,
    blocking: definition.blocking ?? false,
    evaluationCondition: definition.condition,
    applicabilityCriteria: definition.applicability,
    expectedResult: 'Cumple la condición definida.',
    evidenceDescription: definition.evidence,
  }
}

export const GOVERNANCE_RULES: GovernanceRule[] = [
  // DISEÑO: 4 reglas
  defineRule({
    code: 'DES-001',
    name: 'Convenciones de nombres de rutas',
    category: 'DESIGN',
    severity: 'MEDIUM',
    condition:
      'Verificar que las rutas cumplan la convención de nombres configurada.',
    applicability:
      'Documentos que declaren rutas en paths.',
    evidence:
      'Ruta que incumple la convención.',
  }),
  defineRule({
    code: 'DES-002',
    name: 'Uso de métodos HTTP permitidos',
    category: 'DESIGN',
    severity: 'MEDIUM',
    condition:
      'Comprobar los métodos HTTP frente a la política configurada.',
    applicability:
      'Operaciones HTTP declaradas en paths.',
    evidence:
      'Ruta, método y política aplicable.',
  }),
  defineRule({
    code: 'DES-003',
    name: 'Identificadores únicos de operación',
    category: 'DESIGN',
    severity: 'HIGH',
    condition:
      'Verificar que los operationId declarados sean únicos.',
    applicability:
      'Operaciones con identificador operationId.',
    evidence:
      'Identificadores duplicados y operaciones afectadas.',
  }),
  defineRule({
    code: 'DES-004',
    name: 'Definición de respuestas exitosas',
    category: 'DESIGN',
    severity: 'MEDIUM',
    condition:
      'Verificar respuestas de éxito según la política de operaciones.',
    applicability:
      'Operaciones HTTP que requieran respuestas exitosas.',
    evidence:
      'Operación y códigos de respuesta declarados.',
  }),

  // DOCUMENTACIÓN: 4 reglas
  defineRule({
    code: 'DOC-001',
    name: 'Información descriptiva de la API',
    category: 'DOCUMENTATION',
    severity: 'MEDIUM',
    condition:
      'Verificar la presencia de info.description.',
    applicability:
      'Todas las especificaciones evaluables.',
    evidence:
      'Valor o ausencia de info.description.',
  }),
  defineRule({
    code: 'DOC-002',
    name: 'Descripción de operaciones',
    category: 'DOCUMENTATION',
    severity: 'LOW',
    condition:
      'Verificar summary o description en cada operación.',
    applicability:
      'Operaciones HTTP declaradas.',
    evidence:
      'Operaciones sin descripción suficiente.',
  }),
  defineRule({
    code: 'DOC-003',
    name: 'Descripción de parámetros',
    category: 'DOCUMENTATION',
    severity: 'MEDIUM',
    condition:
      'Verificar description en parámetros declarados.',
    applicability:
      'Operaciones o rutas que definan parámetros.',
    evidence:
      'Ubicación y nombre de los parámetros afectados.',
  }),
  defineRule({
    code: 'DOC-004',
    name: 'Documentación de respuestas',
    category: 'DOCUMENTATION',
    severity: 'MEDIUM',
    condition:
      'Comprobar descripciones de respuestas declaradas.',
    applicability:
      'Operaciones HTTP con respuestas.',
    evidence:
      'Operación, código y descripción faltante.',
  }),

  // SEGURIDAD: 3 reglas
  defineRule({
    code: 'SEC-001',
    name: 'Esquemas de seguridad',
    category: 'SECURITY',
    severity: 'HIGH',
    condition:
      'Verificar esquemas en components.securitySchemes.',
    applicability:
      'APIs sujetas a una política de autenticación.',
    evidence:
      'Esquemas declarados o ausencia de ellos.',
  }),
  defineRule({
    code: 'SEC-002',
    name: 'Requisitos de seguridad',
    category: 'SECURITY',
    severity: 'CRITICAL',
    blocking: true,
    condition:
      'Verificar requisitos de seguridad efectivos según herencia y política.',
    applicability:
      'APIs cuya política exige autenticación.',
    evidence:
      'Declaraciones security globales y por operación.',
  }),
  defineRule({
    code: 'SEC-003',
    name: 'Operaciones sin protección declarada',
    category: 'SECURITY',
    severity: 'CRITICAL',
    blocking: true,
    condition:
      'Detectar operaciones sin seguridad exigida por la política.',
    applicability:
      'Operaciones que requieren autenticación.',
    evidence:
      'Ruta, método y requisitos de seguridad efectivos.',
  }),

  // VERSIONAMIENTO: 2 reglas
  defineRule({
    code: 'VER-001',
    name: 'Formato de versión',
    category: 'VERSIONING',
    severity: 'MEDIUM',
    condition:
      'Validar info.version según el formato configurado.',
    applicability:
      'Especificaciones con info.version.',
    evidence:
      'Versión declarada y formato esperado.',
  }),
  defineRule({
    code: 'VER-002',
    name: 'Coherencia de versión',
    category: 'VERSIONING',
    severity: 'HIGH',
    condition:
      'Comparar info.version con la versión registrada.',
    applicability:
      'Documentos asociados a una versión de API.',
    evidence:
      'Versión del documento y versión del catálogo.',
  }),

  // OBSERVABILIDAD: 2 reglas
  defineRule({
    code: 'OBS-001',
    name: 'Identificador de correlación',
    category: 'OBSERVABILITY',
    severity: 'MEDIUM',
    condition:
      'Comprobar la declaración del encabezado de correlación configurado.',
    applicability:
      'Operaciones sujetas a política de trazabilidad.',
    evidence:
      'Operaciones sin el encabezado esperado.',
  }),
  defineRule({
    code: 'OBS-002',
    name: 'Respuestas de error documentadas',
    category: 'OBSERVABILITY',
    severity: 'MEDIUM',
    condition:
      'Verificar respuestas de error según la política configurada.',
    applicability:
      'Operaciones HTTP evaluables.',
    evidence:
      'Operaciones sin respuestas de error documentadas.',
  }),

  // GOBIERNO: 3 reglas
  defineRule({
    code: 'GOV-001',
    name: 'Identificación del responsable',
    category: 'GOVERNANCE',
    severity: 'HIGH',
    condition:
      'Verificar el metadato de responsable definido por la plataforma.',
    applicability:
      'APIs sujetas a política de propiedad.',
    evidence:
      'Identificador de responsable o ausencia del metadato.',
  }),
  defineRule({
    code: 'GOV-002',
    name: 'Clasificación del activo',
    category: 'GOVERNANCE',
    severity: 'MEDIUM',
    condition:
      'Verificar la clasificación definida para el activo API.',
    applicability:
      'APIs sujetas a política de clasificación.',
    evidence:
      'Clasificación registrada o metadato ausente.',
  }),
  defineRule({
    code: 'GOV-003',
    name: 'Identificación del contrato',
    category: 'GOVERNANCE',
    severity: 'MEDIUM',
    condition:
      'Comprobar los metadatos definidos para identificar el contrato.',
    applicability:
      'Documentos asociados a una API registrada.',
    evidence:
      'Identificadores del activo, versión y documento.',
  }),
]
