
import type { ReactNode } from 'react';

import { Navigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

import type {
  AppRole,
} from '../types/auth.types';

interface ProtectedRouteProps {
  children: ReactNode;

  // Opcional: restringir el acceso a roles específicos.
  allowedRoles?: readonly AppRole[];
}

export function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();

  // 1. Usuario no autenticado.
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Validar los roles si fueron especificados.
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

  // 3. Usuario autenticado y autorizado.
  return <>{children}</>;
}
