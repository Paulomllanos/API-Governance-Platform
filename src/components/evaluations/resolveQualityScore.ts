
import type {
  BackendEvaluation,
} from '../../features/evaluations/services/evaluations.api';

export type QualityScoreSource =
  | 'DEFINITIVE'
  | 'PROVISIONAL'
  | 'UNAVAILABLE';

export interface ResolvedQualityScore {
  score: number | null;
  source: QualityScoreSource;
  hasBlockingIssues: boolean | null;
}

function isValidScore(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value >= 0 &&
    value <= 100
  );
}

export function resolveQualityScore(
  execution: Pick<
    BackendEvaluation,
    | 'status'
    | 'qualityScore'
    | 'hasBlockingIssues'
    | 'scoreAssessment'
  >,
): ResolvedQualityScore {
  // Solo las evaluaciones completadas pueden tener puntuación.
  if (execution.status !== 'COMPLETED') {
    return {
      score: null,
      source: 'UNAVAILABLE',
      hasBlockingIssues: null,
    };
  }

  // Prioridad 1: puntuación definitiva persistida.
  if (isValidScore(execution.qualityScore)) {
    return {
      score: execution.qualityScore,
      source: 'DEFINITIVE',
      hasBlockingIssues: execution.hasBlockingIssues,
    };
  }

  // Prioridad 2: puntuación provisional histórica.
  const assessment = execution.scoreAssessment;

  if (
    assessment?.isProvisional === true &&
    isValidScore(assessment.score)
  ) {
    return {
      score: assessment.score,
      source: 'PROVISIONAL',
      hasBlockingIssues: null,
    };
  }

  // Sin puntuación disponible.
  return {
    score: null,
    source: 'UNAVAILABLE',
    hasBlockingIssues: null,
  };
}
