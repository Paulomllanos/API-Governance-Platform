
import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react'

interface User {
  name: string
  email: string
  role: string
}

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  login: (email: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
)

const AUTH_STORAGE_KEY = 'api-governance-mock-user'

function getStoredUser(): User | null {
  try {
    const storedUser = sessionStorage.getItem(AUTH_STORAGE_KEY)

    if (!storedUser) {
      return null
    }

    const parsed: unknown = JSON.parse(storedUser)

    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      !('name' in parsed) ||
      typeof parsed.name !== 'string' ||
      !('email' in parsed) ||
      typeof parsed.email !== 'string' ||
      !('role' in parsed) ||
      typeof parsed.role !== 'string'
    ) {
      sessionStorage.removeItem(AUTH_STORAGE_KEY)
      return null
    }

    return {
      name: parsed.name,
      email: parsed.email,
      role: parsed.role,
    }
  } catch {
    return null
  }
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(getStoredUser)

  const login = (email: string) => {
    const authenticatedUser: User = {
      name: 'Paulo',
      email,
      role: 'Administrador',
    }

    sessionStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify(authenticatedUser),
    )

    setUser(authenticatedUser)
  }

  const logout = () => {
    sessionStorage.removeItem(AUTH_STORAGE_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error(
      'useAuth debe utilizarse dentro de AuthProvider',
    )
  }

  return context
}
