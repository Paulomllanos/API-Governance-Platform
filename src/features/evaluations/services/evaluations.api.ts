
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export type EvaluationStatus =
    | 'PENDING'
    | 'RUNNING'
    | 'COMPLETED'
    | 'FAILED'

export type RuleResultStatus =
    | 'PASS'
    | 'FAIL'
    | 'WARNING'
    | 'NOT_APPLICABLE'

export interface BackendRuleResult {
    id: string
    executionId: string
    ruleId: string
    status: RuleResultStatus
    message: string
    evidence: string | null
    recommendation: string | null

    ruleName: string | null

    category:
    | 'DESIGN'
    | 'DOCUMENTATION'
    | 'SECURITY'
    | 'VERSIONING'
    | 'OBSERVABILITY'
    | 'GOVERNANCE'
    | null

    severity:
    | 'LOW'
    | 'MEDIUM'
    | 'HIGH'
    | 'CRITICAL'
    | null

    weight: number | null

}

export interface BackendScoreAssessment {
    score: number | null
    executedRules: number
    expectedRules: number
    applicableRules: number
    excludedRules: number
    coveragePercentage: number
    isProvisional: boolean
    criticalFailuresDetectedInExecutedRules: boolean
}

export interface BackendEvaluation {
    id: string
    documentId: string
    executedBy: string
    status: EvaluationStatus

    requestedAt: string
    startedAt: string | null
    completedAt: string | null

    qualityScore: number | null
    hasBlockingIssues: boolean | null

    totalRules: number
    passedRules: number
    failedRules: number
    warningRules: number
    notApplicableRules: number

    errorMessage: string | null

    scoreAssessment?: BackendScoreAssessment | null

    results?: BackendRuleResult[]

    document?: {
        id: string
        fileName: string
        format: 'JSON' | 'YAML'
        openApiVersion: string
        apiVersion: {
            id: string
            version: string
            api: {
                id: string
                name: string
            }
        }
    }
}

async function request<T>(
    endpoint: string,
    options: RequestInit = {},
): Promise<T> {
    if (!API_BASE_URL) {
        throw new Error(
            'No se ha configurado VITE_API_BASE_URL.',
        )
    }

    const response = await fetch(
        `${API_BASE_URL}${endpoint}`,
        {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        },
    )

    if (!response.ok) {
        throw new Error(
            `Error HTTP ${response.status}: ${response.statusText}`,
        )
    }

    return response.json() as Promise<T>
}

// Registrar una evaluación en estado PENDING.
export async function createEvaluationRequest(
    documentId: string,
): Promise<BackendEvaluation> {
    return request<BackendEvaluation>(
        `/documents/${encodeURIComponent(documentId)}/evaluations`,
        {
            method: 'POST',
        },
    )
}

// Ejecutar las reglas sobre una evaluación pendiente.
export async function executeEvaluationRequest(
    evaluationId: string,
): Promise<BackendEvaluation> {
    return request<BackendEvaluation>(
        `/evaluations/${encodeURIComponent(evaluationId)}/execute`,
        {
            method: 'POST',
        },
    )
}

// Consultar todas las evaluaciones registradas.
export async function fetchEvaluations(): Promise<
    BackendEvaluation[]
> {
    return request<BackendEvaluation[]>('/evaluations')
}

// Consultar las evaluaciones de un documento.
export async function fetchEvaluationsByDocumentId(
    documentId: string,
): Promise<BackendEvaluation[]> {
    return request<BackendEvaluation[]>(
        `/documents/${encodeURIComponent(documentId)}/evaluations`,
    )
}

// Consultar una evaluación con sus resultados individuales.
export async function fetchEvaluationById(
    evaluationId: string,
): Promise<BackendEvaluation> {
    return request<BackendEvaluation>(
        `/evaluations/${encodeURIComponent(evaluationId)}`,
    )
}
