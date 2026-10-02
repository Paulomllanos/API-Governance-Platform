import {
  Bell,
  ChevronDown,
  Search,
} from 'lucide-react'

import './Topbar.css'

export function Topbar() {
  return (
    <header className="topbar">
      <div className="topbar-search">
        <Search size={17} />

        <input
          type="search"
          placeholder="Buscar APIs, evaluaciones, hallazgos..."
          aria-label="Buscar"
        />
      </div>

      <div className="topbar-actions">
        <button
          type="button"
          className="topbar-icon-button"
          aria-label="Notificaciones"
        >
          <Bell size={18} />
          <span className="topbar-notification-dot" />
        </button>

        <button
          type="button"
          className="topbar-profile"
        >
          <div className="topbar-avatar">
            P
          </div>

          <div className="topbar-user">
            <strong>Paulo</strong>
            <span>Administrador</span>
          </div>

          <ChevronDown size={15} />
        </button>
      </div>
    </header>
  )
}