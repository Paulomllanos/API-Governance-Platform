
import { describe, expect, it } from 'vitest';

import type {
  BackendScoreAssessment,
} from '../../features/evaluations/services/evaluations.api';

import {
  resolveQualityScore,
} from './resolveQualityScore';

describe('resolveQualityScore', () => {
  // Fixture que respeta el contrato real del backend.
  const provisionalAssessment: BackendScoreAssessment = {
    score: 81,
    executedRules: 18,
    expectedRules: 18,
    applicableRules: 16,
    excludedRules: 2,
    coveragePercentage: 100,
    isProvisional: true,
    criticalFailuresDetectedInExecutedRules: false,
  };

  it('prioriza el score definitivo', () => {
    const result = resolveQualityScore({
      status: 'COMPLETED',
      qualityScore: 92.5,
      hasBlockingIssues: false,
      scoreAssessment: provisionalAssessment,
    });

    expect(result.score).toBe(92.5);
    expect(result.source).toBe('DEFINITIVE');
    expect(result.hasBlockingIssues).toBe(false);
  });

  it('acepta el score definitivo igual a cero', () => {
    const result = resolveQualityScore({
      status: 'COMPLETED',
      qualityScore: 0,
      hasBlockingIssues: true,
    });

    expect(result.score).toBe(0);
    expect(result.source).toBe('DEFINITIVE');
    expect(result.hasBlockingIssues).toBe(true);
  });

  it('utiliza un score histórico provisional', () => {
    const result = resolveQualityScore({
      status: 'COMPLETED',
      qualityScore: null,
      hasBlockingIssues: null,
      scoreAssessment: {
        ...provisionalAssessment,
        score: 76.5,
      },
    });

    expect(result.score).toBe(76.5);
    expect(result.source).toBe('PROVISIONAL');
    expect(result.hasBlockingIssues).toBeNull();
  });

  it('no inventa un score sin información', () => {
    const result = resolveQualityScore({
      status: 'COMPLETED',
      qualityScore: null,
      hasBlockingIssues: null,
    });

    expect(result.source).toBe('UNAVAILABLE');
    expect(result.score).toBeNull();
  });

  it('no muestra puntuación de una ejecución pendiente', () => {
    const result = resolveQualityScore({
      status: 'PENDING',
      qualityScore: null,
      hasBlockingIssues: null,
      scoreAssessment: {
        ...provisionalAssessment,
        score: 85,
      },
    });

    expect(result.source).toBe('UNAVAILABLE');
    expect(result.score).toBeNull();
  });

  it('no presenta una puntuación no provisional como provisional', () => {
    const result = resolveQualityScore({
      status: 'COMPLETED',
      qualityScore: null,
      hasBlockingIssues: null,
      scoreAssessment: {
        ...provisionalAssessment,
        isProvisional: false,
      },
    });

    expect(result.source).toBe('UNAVAILABLE');
    expect(result.score).toBeNull();
  });

  it('no presenta una puntuación fuera del rango permitido', () => {
    const result = resolveQualityScore({
      status: 'COMPLETED',
      qualityScore: 120,
      hasBlockingIssues: false,
    });

    expect(result.source).toBe('UNAVAILABLE');
    expect(result.score).toBeNull();
  });
});
