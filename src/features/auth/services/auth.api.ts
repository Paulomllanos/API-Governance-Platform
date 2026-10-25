
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

export async function login(
  credentials: LoginRequest,
): Promise<LoginResponse> {
  if (!API_BASE_URL) {
    throw new Error(
      'No se ha configurado VITE_API_BASE_URL.',
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/auth/login`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
      cache: 'no-store',
    },
  );

  if (response.status === 401) {
    throw new Error('Correo o contraseña incorrectos.');
  }

  if (!response.ok) {
    throw new Error(
      'No fue posible iniciar sesión.',
    );
  }

  const data = (await response.json()) as LoginResponse;

  if (
    !data.accessToken ||
    data.tokenType !== 'Bearer'
  ) {
    throw new Error(
      'La respuesta de autenticación es inválida.',
    );
  }

  setAccessToken(data.accessToken);

  return data;
}

export async function fetchAuthenticatedUser():
  Promise<AuthenticatedUser> {
  const token = getAccessToken();

  if (!token) {
    throw new Error('No existe una sesión activa.');
  }

  const response = await fetch(
    `${API_BASE_URL}/auth/me`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    },
  );

  if (response.status === 401) {
    clearAccessToken();
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

export function logout(): void {
  clearAccessToken();
}
