import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

import { subscribeToSessionCleared } from "../services/auth-token";

import {
  login as loginApi,
  logout as logoutApi,
  fetchAuthenticatedUser,
} from "../services/auth.api";

import type { AppRole, AuthenticatedUser } from "../types/auth.types";

// Mantiene compatibilidad con componentes existentes
// que utilizan user.name y user.role.
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

  login: (email: string, password: string) => Promise<void>;

  logout: () => void;

  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const ROLE_LABELS: Record<AppRole, string> = {
  ADMIN: "Administrador",
  REVIEWER: "Revisor",
  DEVELOPER: "Desarrollador",
};

function mapAuthenticatedUser(authenticatedUser: AuthenticatedUser): User {
  const primaryRole = authenticatedUser.roles[0];

  return {
    id: authenticatedUser.id,
    name: authenticatedUser.displayName,
    email: authenticatedUser.email,
    role: primaryRole ? ROLE_LABELS[primaryRole] : "Sin rol asignado",
    roles: authenticatedUser.roles,
  };
}

export function AuthProvider({ children }: AuthProviderProps) {
  // La sesión comienza sin autenticar.
  // No recuperamos usuarios simulados de sessionStorage.
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    return subscribeToSessionCleared(() => {
      setUser(null);
    });
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    // Invalidar primero cualquier sesión anterior.
    logoutApi();
    setUser(null);

    // NestJS verifica las credenciales y devuelve el JWT.
    const response = await loginApi({
      email: email.trim(),
      password,
    });

    // auth.api.ts ya guarda el token en memoria.
    // Aquí conservamos los datos del usuario.
    setUser(mapAuthenticatedUser(response.user));
  };

  const logout = (): void => {
    logoutApi();
    setUser(null);
  };

  const refreshUser = async (): Promise<void> => {
    try {
      // Consulta GET /auth/me con el JWT vigente.
      const authenticatedUser = await fetchAuthenticatedUser();

      setUser(mapAuthenticatedUser(authenticatedUser));
    } catch (error) {
      logoutApi();
      setUser(null);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
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
    throw new Error("useAuth debe utilizarse dentro de AuthProvider");
  }

  return context;
}
