
import type {
  AuthenticatedUser,
  LoginRequest,
  LoginResponse,
} from '../types/auth.types';

import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from './auth-token';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Comparte una renovación que ya esté en curso.
// Es especialmente importante con React.StrictMode.
let refreshPromise: Promise<LoginResponse> | null = null;

function getAuthUrl(path: string): string {
  if (!API_BASE_URL) {
    throw new Error(
      'No se ha configurado VITE_API_BASE_URL.',
    );
  }

  return `${API_BASE_URL}/auth/${path}`;
}

function validateAuthResponse(
  data: LoginResponse,
): LoginResponse {
  if (
    !data.accessToken ||
    data.tokenType !== 'Bearer' ||
    !data.user
  ) {
    throw new Error(
      'La respuesta de autenticación es inválida.',
    );
  }

  return data;
}

export async function login(
  credentials: LoginRequest,
): Promise<LoginResponse> {
  const response = await fetch(getAuthUrl('login'), {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
    cache: 'no-store',
  });

  if (response.status === 401) {
    throw new Error(
      'Correo o contraseña incorrectos.',
    );
  }

  if (!response.ok) {
    throw new Error(
      'No fue posible iniciar sesión.',
    );
  }

  const data = validateAuthResponse(
    (await response.json()) as LoginResponse,
  );

  setAccessToken(data.accessToken);

  return data;
}

export function refreshSession(): Promise<LoginResponse> {
  if (refreshPromise) {
    return refreshPromise;
  }

  const operation = async (): Promise<LoginResponse> => {
    const response = await fetch(
      getAuthUrl('refresh'),
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      },
    );


    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        clearAccessToken();

        throw new Error(
          'La sesión expiró o fue revocada.',
        );
      }

      throw new Error(
        `No se pudo verificar la sesión (${response.status}).`,
      );
    }


    const data = validateAuthResponse(
      (await response.json()) as LoginResponse,
    );

    setAccessToken(data.accessToken);

    return data;
  };

  refreshPromise = operation().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

export async function fetchAuthenticatedUser():
  Promise<AuthenticatedUser> {
  const token = getAccessToken();

  if (!token) {
    throw new Error(
      'No existe una sesión activa.',
    );
  }

  const response = await fetch(
    getAuthUrl('me'),
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    },
  );

  if (response.status === 401) {
    if (getAccessToken() === token) {
      clearAccessToken();
    }

    throw new Error(
      'La sesión expiró o dejó de ser válida.',
    );
  }

  if (!response.ok) {
    throw new Error(
      'No fue posible consultar el usuario.',
    );
  }

  return response.json() as Promise<AuthenticatedUser>;
}

// Cierre de sesión local, para compatibilidad
// con AuthContext durante la transición.
export function clearLocalSession(): void {
  clearAccessToken();
}

// Cierra la sesión en PostgreSQL y en el navegador.
export async function logout(): Promise<void> {
  try {
    await fetch(getAuthUrl('logout'), {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
  } finally {
    clearAccessToken();
  }
}
