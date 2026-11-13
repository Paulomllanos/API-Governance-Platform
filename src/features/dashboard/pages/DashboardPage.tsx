
import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  ArrowRight,
  CheckCircle2,
  FileSearch,
  Plus,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';

import { Link, useNavigate } from 'react-router-dom';

import {
  Badge,
} from '../../../components/ui/Badge/Badge';

import {
  Button,
} from '../../../components/ui/Button/Button';

import {
  Card,
} from '../../../components/ui/Card/Card';

import {
  useAuth,
} from '../../auth/context/AuthContext';

import {
  MetricCard,
} from '../components/MetricCard/MetricCard';

import {
  fetchDashboardSummary,
} from '../services/dashboard.api';

import type {
  DashboardSummaryResponse,
} from '../types/dashboard-response.types';

import type {
  ApiAttentionStatus,
  ActivityType,
  DashboardMetric,
} from '../types/dashboard.types';

import './DashboardPage.css';

const statusConfig: Record<
  ApiAttentionStatus,
  {
    label: string;
    variant: 'danger' | 'warning' | 'success';
  }
> = {
  critical: {
    label: 'Crítico',
    variant: 'danger',
  },
  correction: {
    label: 'En corrección',
    variant: 'warning',
  },
  review: {
    label: 'Requiere decisión',
    variant: 'success',
  },
};

const activityIcons: Record<
  ActivityType,
  typeof FileSearch
> = {
  evaluation: FileSearch,
  finding: ShieldAlert,
  reevaluation: RefreshCw,
  approval: CheckCircle2,
};

function formatScore(score: number | null): string {
  return score === null
    ? '—'
    : score.toLocaleString('es-CL', {
        maximumFractionDigits: 2,
      });
}

function formatActivityTime(value: string): string {
  return new Date(value).toLocaleString('es-CL', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [data, setData] =
    useState<DashboardSummaryResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchDashboardSummary();
      setData(result);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'No fue posible cargar el Dashboard.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const metrics: DashboardMetric[] = data
    ? [
        {
          id: 'apis',
          label: 'APIs registradas',
          value: String(data.metrics.totalApis),
          description:
            `${data.metrics.activeApis} activas`,
          tone: 'primary',
        },
        {
          id: 'evaluations',
          label: 'Evaluaciones',
          value: String(data.metrics.totalEvaluations),
          description:
            `${data.metrics.completedEvaluations} completadas`,
          tone: 'success',
        },
        {
          id: 'pending',
          label: 'Pendientes de revisión',
          value: String(data.metrics.pendingReviews),
          description: 'Versiones en revisión',
          tone: 'warning',
        },
        {
          id: 'score',
          label: 'Quality Score promedio',
          value: formatScore(data.metrics.averageScore),
          description:
            `${data.metrics.scoredVersions} versiones evaluadas`,
          tone: 'success',
        },
      ]
    : [];

  const attentionApis = data?.attentionApis ?? [];
  const governanceCategories =
    data?.governanceCategories ?? [];
  const recentActivity = data?.recentActivity ?? [];

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <span className="dashboard-eyebrow">
            Governance Workspace
          </span>

          <h1>
            Panel de gobierno
          </h1>

          <p>
            {user?.name
              ? `Bienvenido, ${user.name}. `
              : ''}
            {data
              ? `${data.metrics.pendingReviews} versión(es) pendientes de revisión.`
              : 'Resumen del gobierno de APIs.'}
          </p>
        </div>

        <div className="dashboard-header__actions">
          <Button
            onClick={() => void loadDashboard()}
            disabled={loading}
          >
            <RefreshCw size={16} />
            Actualizar
          </Button>

          <Button
            onClick={() => navigate('/app/apis')}
          >
            <Plus size={17} />
            Catálogo de APIs
          </Button>
        </div>
      </header>

      {loading && (
        <p role="status" className="dashboard-state">
          Consultando métricas desde PostgreSQL...
        </p>
      )}

      {error && (
        <div role="alert" className="dashboard-state">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => void loadDashboard()}
          >
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && data && (
        <>
          <section
            className="dashboard-metrics"
            aria-label="Resumen"
          >
            {metrics.map((metric) => (
              <MetricCard
                key={metric.id}
                metric={metric}
              />
            ))}
          </section>

          <div className="dashboard-main-grid">
            <Card className="dashboard-section attention-section">
              <div className="dashboard-section-header">
                <div>
                  <h2>Requieren tu atención</h2>
                  <p>
                    Versiones con bloqueantes o decisiones pendientes.
                  </p>
                </div>

                <Link
                  to="/app/review"
                  className="dashboard-text-action"
                >
                  Ver todas
                  <ArrowRight size={15} />
                </Link>
              </div>

              <div className="attention-list">
                {attentionApis.length === 0 && (
                  <p className="dashboard-empty">
                    No hay versiones que requieran atención.
                  </p>
                )}

                {attentionApis.map((api) => {
                  const status = statusConfig[api.status];

                  return (
                    <button
                      type="button"
                      className="attention-item"
                      key={api.id}
                      onClick={() =>
                        navigate(`/app/apis/${api.apiId}`)
                      }
                    >
                      <div className="attention-api">
                        <div className="attention-api-icon">
                          {api.name
                            .split(' ')
                            .map((word) => word[0])
                            .join('')
                            .slice(0, 2)}
                        </div>

                        <div>
                          <strong>{api.name}</strong>
                          <span>{api.version}</span>
                        </div>
                      </div>

                      <div className="attention-score">
                        <span>Score</span>
                        <strong>{formatScore(api.score)}</strong>
                      </div>

                      <div className="attention-findings">
                        <span>Hallazgos</span>
                        <strong>{api.findings}</strong>
                      </div>

                      <div className="attention-status">
                        <Badge variant={status.variant}>
                          {status.label}
                        </Badge>

                        {api.criticalFindings > 0 && (
                          <span className="attention-critical">
                            {api.criticalFindings} bloqueante(s)
                          </span>
                        )}
                      </div>

                      <ArrowRight
                        className="attention-arrow"
                        size={17}
                      />
                    </button>
                  );
                })}
              </div>
            </Card>

            <Card className="dashboard-section governance-section">
              <div className="dashboard-section-header">
                <div>
                  <h2>Cumplimiento por categoría</h2>
                  <p>
                    Porcentaje de reglas aplicables que aprobaron.
                  </p>
                </div>
              </div>

              <div className="governance-categories">
                {governanceCategories.map((category) => (
                  <div
                    className="governance-category"
                    key={category.id}
                  >
                    <div className="governance-category-header">
                      <span>{category.name}</span>

                      <strong>
                        {category.score === null
                          ? 'Sin datos'
                          : `${category.score}%`}
                      </strong>
                    </div>

                    <div className="governance-progress">
                      <div
                        className="governance-progress-value"
                        style={{
                          width:
                            `${category.score ?? 0}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card className="dashboard-section activity-section">
            <div className="dashboard-section-header">
              <div>
                <h2>Actividad reciente</h2>
                <p>
                  Últimas transiciones registradas del workflow.
                </p>
              </div>

              <Link
                to="/app/audit"
                className="dashboard-text-action"
              >
                Ver auditoría
                <ArrowRight size={15} />
              </Link>
            </div>

            <div className="activity-list">
              {recentActivity.length === 0 && (
                <p className="dashboard-empty">
                  Todavía no hay transiciones registradas.
                </p>
              )}

              {recentActivity.map((activity) => {
                const Icon =
                  activityIcons[activity.type];

                return (
                  <div
                    className="activity-item"
                    key={activity.id}
                  >
                    <div
                      className={
                        `activity-icon activity-icon--${activity.type}`
                      }
                    >
                      <Icon size={17} />
                    </div>

                    <div className="activity-content">
                      <strong>{activity.title}</strong>
                      <span>{activity.description}</span>
                    </div>

                    <time dateTime={activity.time}>
                      {formatActivityTime(activity.time)}
                    </time>
                  </div>
                );
              })}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
