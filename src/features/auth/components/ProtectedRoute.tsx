
import type { ReactNode } from 'react';

import { Navigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

import type {
  AppRole,
} from '../types/auth.types';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: readonly AppRole[];
}

export function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const {
    user,
    isAuthenticated,
    isInitializing,
  } = useAuth();

  // No redirigir mientras intentamos
  // recuperar una sesión mediante refresh token.
  if (isInitializing) {
    return (
      <main
        role="status"
        aria-live="polite"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        Recuperando sesión...
      </main>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const hasAllowedRole = user.roles.some(
      (role) => allowedRoles.includes(role),
    );

    if (!hasAllowedRole) {
      return (
        <Navigate
          to="/app/forbidden"
          replace
        />
      );
    }
  }

  return <>{children}</>;
}
