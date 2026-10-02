import {
  LayoutDashboard,
  Boxes,
  ClipboardCheck,
  TriangleAlert,
  GitPullRequest,
  ListChecks,
  ScrollText,
  Settings,
  ShieldCheck,
} from 'lucide-react'

import { NavLink } from 'react-router-dom'

import './Sidebar.css'

const mainNavigation = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    to: '/app/dashboard',
  },
  {
    label: 'APIs',
    icon: Boxes,
    to: '/app/apis',
  },
  {
    label: 'Evaluaciones',
    icon: ClipboardCheck,
    to: '/app/evaluations',
  },
  {
    label: 'Hallazgos',
    icon: TriangleAlert,
    to: '/app/findings',
  },
  {
    label: 'Revisión',
    icon: GitPullRequest,
    to: '/app/review',
  },
  {
    label: 'Reglas',
    icon: ListChecks,
    to: '/app/rules',
  },
  {
    label: 'Auditoría',
    icon: ScrollText,
    to: '/app/audit',
  },
]

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <ShieldCheck size={20} />
        </div>

        <div className="sidebar-brand-text">
          <strong>API</strong>
          <span>Governance</span>
        </div>
      </div>

      <nav
        className="sidebar-navigation"
        aria-label="Navegación principal"
      >
        {mainNavigation.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `sidebar-link ${
                  isActive ? 'sidebar-link--active' : ''
                }`
              }
            >
              <Icon size={18} strokeWidth={1.8} />

              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        <NavLink
          to="/app/settings"
          className={({ isActive }) =>
            `sidebar-link ${
              isActive ? 'sidebar-link--active' : ''
            }`
          }
        >
          <Settings size={18} strokeWidth={1.8} />

          <span>Configuración</span>
        </NavLink>
      </div>
    </aside>
  )
}