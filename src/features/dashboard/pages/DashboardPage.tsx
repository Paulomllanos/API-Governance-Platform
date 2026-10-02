import './DashboardPage.css'

export function DashboardPage() {
  return (
    <div className="dashboard-page">
      <div className="dashboard-heading">
        <span>Governance Workspace</span>

        <h1>Buenos días, Paulo.</h1>

        <p>
          Aquí tienes un resumen del estado de tu ecosistema de APIs.
        </p>
      </div>

      <div className="dashboard-placeholder">
        <span>Dashboard</span>

        <strong>
          La estructura principal está funcionando.
        </strong>

        <p>
          En el siguiente paso construiremos las métricas,
          APIs que requieren atención y estado del gobierno.
        </p>
      </div>
    </div>
  )
}