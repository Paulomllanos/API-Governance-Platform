
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import {
  login as loginApi,
  logout as logoutApi,
  clearLocalSession,
  refreshSession,
  fetchAuthenticatedUser,
} from '../services/auth.api';

import {
  subscribeToSessionCleared,
} from '../services/auth-token';

import type {
  AppRole,
  AuthenticatedUser,
} from '../types/auth.types';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  roles: AppRole[];
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean;

  login: (
    email: string,
    password: string,
  ) => Promise<void>;

  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<
  AuthContextValue | undefined
>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const ROLE_LABELS: Record<AppRole, string> = {
  ADMIN: 'Administrador',
  REVIEWER: 'Revisor',
  DEVELOPER: 'Desarrollador',
};

function mapAuthenticatedUser(
  authenticatedUser: AuthenticatedUser,
): User {
  const primaryRole = authenticatedUser.roles[0];

  return {
    id: authenticatedUser.id,
    name: authenticatedUser.displayName,
    email: authenticatedUser.email,
    role: primaryRole
      ? ROLE_LABELS[primaryRole]
      : 'Sin rol asignado',
    roles: authenticatedUser.roles,
  };
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);

  const [isInitializing, setIsInitializing] =
    useState(true);

  // Sincroniza el estado de React cuando
  // un servicio HTTP invalida el access token.
  useEffect(() => {
    return subscribeToSessionCleared(() => {
      setUser(null);
    });
  }, []);

  // Intenta recuperar la sesión al iniciar React.
  useEffect(() => {
    let active = true;

    void refreshSession()
      .then((response) => {
        if (active) {
          setUser(
            mapAuthenticatedUser(response.user),
          );
        }
      })
      .catch(() => {
        if (active) {
          setUser(null);
        }
      })
      .finally(() => {
        if (active) {
          setIsInitializing(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const login = async (
    email: string,
    password: string,
  ): Promise<void> => {
    clearLocalSession();
    setUser(null);

    const response = await loginApi({
      email: email.trim(),
      password,
    });

    setUser(
      mapAuthenticatedUser(response.user),
    );
  };

  const logout = async (): Promise<void> => {
    // Invalidamos inmediatamente la sesión visual.
    clearLocalSession();
    setUser(null);

    // El servidor revoca la sesión y elimina la cookie.
    await logoutApi();
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const authenticatedUser =
        await fetchAuthenticatedUser();

      setUser(
        mapAuthenticatedUser(authenticatedUser),
      );
    } catch (error) {
      clearLocalSession();
      setUser(null);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isInitializing,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth debe utilizarse dentro de AuthProvider',
    );
  }

  return context;
}

