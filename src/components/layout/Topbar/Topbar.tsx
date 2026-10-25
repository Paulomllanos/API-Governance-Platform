
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Bell,
  ChevronDown,
  Search,
  LogOut,
  UserRound,
} from 'lucide-react';

import { useAuth } from '../../../features/auth/context/AuthContext';

import './Topbar.css';

export function Topbar() {
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const displayName = user?.name ?? 'Usuario';
  const displayRole = user?.role ?? 'Sin rol';

  const initials = displayName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'U';

  function handleLogout() {
    setIsProfileOpen(false);

    logout();

    navigate('/login', {
      replace: true,
    });
  }

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

        <div
          className="topbar-profile-container"
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setIsProfileOpen(false);
            }
          }}
        >
          <button
            type="button"
            className="topbar-profile"
            aria-label="Abrir menú de perfil"
            aria-expanded={isProfileOpen}
            aria-controls="topbar-profile-menu"
            onClick={() => {
              setIsProfileOpen((previous) => !previous);
            }}
          >
            <div className="topbar-avatar">
              {initials}
            </div>

            <div className="topbar-user">
              <strong>{displayName}</strong>
              <span>{displayRole}</span>
            </div>

            <ChevronDown
              size={15}
              className={
                isProfileOpen
                  ? 'topbar-chevron topbar-chevron--open'
                  : 'topbar-chevron'
              }
            />
          </button>

          {isProfileOpen && (
            <div
              id="topbar-profile-menu"
              className="topbar-profile-menu"
            >
              <div className="topbar-profile-menu__header">
                <UserRound size={17} />

                <div>
                  <strong>{displayName}</strong>
                  <span>{user?.email ?? ''}</span>
                </div>
              </div>

              <div className="topbar-profile-menu__divider" />

              <button
                type="button"
                className="topbar-profile-menu__logout"
                onClick={handleLogout}
              >
                <LogOut size={17} />
                <span>Cerrar sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
