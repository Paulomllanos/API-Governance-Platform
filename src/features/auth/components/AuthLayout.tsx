import type { ReactNode } from 'react'
import { ShieldCheck, ScanSearch, GitPullRequest } from 'lucide-react'
import './AuthLayout.css'

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="auth-layout">
      <section className="auth-brand-panel">
        <div className="auth-brand-content">
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <ShieldCheck size={22} strokeWidth={2} />
            </div>

            <span>API Governance</span>
          </div>

          <div className="auth-brand-message">
            <span className="auth-eyebrow">
              Governance Workspace
            </span>

            <h1>
              APIs más seguras.
              <br />
              Decisiones más claras.
            </h1>

            <p>
              Centraliza la evaluación, trazabilidad y aprobación
              de tus APIs en un único espacio de gobierno.
            </p>
          </div>

          <div className="auth-capabilities">
            <div className="auth-capability">
              <ScanSearch size={20} />

              <div>
                <strong>Evaluación automatizada</strong>
                <span>
                  Detecta incumplimientos directamente desde OpenAPI.
                </span>
              </div>
            </div>

            <div className="auth-capability">
              <ShieldCheck size={20} />

              <div>
                <strong>Gobierno medible</strong>
                <span>
                  Convierte criterios técnicos en resultados verificables.
                </span>
              </div>
            </div>

            <div className="auth-capability">
              <GitPullRequest size={20} />

              <div>
                <strong>Revisión trazable</strong>
                <span>
                  Sigue cada API desde la evaluación hasta su aprobación.
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-decoration auth-decoration--one" />
        <div className="auth-decoration auth-decoration--two" />
      </section>

      <section className="auth-form-panel">
        <div className="auth-form-container">
          {children}
        </div>
      </section>
    </main>
  )
}