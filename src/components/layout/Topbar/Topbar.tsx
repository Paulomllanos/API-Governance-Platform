import { GlobalSearch } from "../../../features/search/GlobalSearch";
import { NotificationBell } from "../../../features/notifications/NotificationBell";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { ChevronDown, LogOut, UserRound, Settings } from "lucide-react";

import { useAuth } from "../../../features/auth/context/AuthContext";

import "./Topbar.css";

export function Topbar() {
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const displayName = user?.name ?? "Usuario";
  const displayRole = user?.role ?? "Sin rol";

  const initials =
    displayName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "U";

  async function handleLogout(): Promise<void> {
    setIsProfileOpen(false);

    try {
      await logout();
    } catch (error) {
      console.error(
        "No se pudo confirmar el cierre de sesión en el servidor.",
        error,
      );
    } finally {
      navigate("/login", {
        replace: true,
      });
    }
  }

  return (
    <header className="topbar">
      <GlobalSearch />

      <div className="topbar-actions">
        <NotificationBell />

        <div
          className="topbar-profile-container"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
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
            <div className="topbar-avatar">{initials}</div>

            <div className="topbar-user">
              <strong>{displayName}</strong>
              <span>{displayRole}</span>
            </div>

            <ChevronDown
              size={15}
              className={
                isProfileOpen
                  ? "topbar-chevron topbar-chevron--open"
                  : "topbar-chevron"
              }
            />
          </button>

          {isProfileOpen && (
            <div id="topbar-profile-menu" className="topbar-profile-menu">
              <div className="topbar-profile-menu__header">
                <UserRound size={17} />

                <div>
                  <strong>{displayName}</strong>
                  <span>{user?.email ?? ""}</span>
                </div>
              </div>

              <button type="button" className="topbar-profile-menu__logout" style={{color:'#334155'}} onClick={() => {setIsProfileOpen(false);navigate('/app/settings')}}>
                <Settings size={17} /><span>Mi perfil y configuración</span>
              </button>
              {user?.roles.includes('ADMIN') && <button type="button" className="topbar-profile-menu__logout" style={{color:'#334155'}} onClick={() => {setIsProfileOpen(false);navigate('/app/settings/users')}}>
                <UserRound size={17} /><span>Administrar usuarios</span>
              </button>}
              <div className="topbar-profile-menu__divider" />

              <button
                type="button"
                className="topbar-profile-menu__logout"
                onClick={() => {
                  void handleLogout();
                }}
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
