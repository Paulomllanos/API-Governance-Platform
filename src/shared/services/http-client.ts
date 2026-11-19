
import {
  getAccessToken,
  clearAccessToken,
} from '../../features/auth/services/auth-token';

import {
  refreshSession,
} from '../../features/auth/services/auth.api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class HttpError extends Error {
  readonly status: number;

  constructor(
    status: number,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

function buildHeaders(
  token: string,
  options: RequestInit,
): Headers {
  const headers = new Headers(options.headers);

  headers.set('Authorization', `Bearer ${token}`);

  if (
    options.body != null &&
    !(options.body instanceof FormData) &&
    !headers.has('Content-Type')
  ) {
    headers.set('Content-Type', 'application/json');
  }

  return headers;
}

async function sendRequest(
  url: string,
  options: RequestInit,
  token: string,
): Promise<Response> {
  return fetch(url, {
    ...options,
    headers: buildHeaders(token, options),
    cache: 'no-store',
  });
}

export async function httpRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error(
      'No se ha configurado VITE_API_BASE_URL.',
    );
  }

  const token = getAccessToken();

  if (!token) {
    throw new HttpError(
      401,
      'No existe una sesión autenticada.',
    );
  }

  const url = `${API_BASE_URL}${endpoint}`;

  let response = await sendRequest(
    url,
    options,
    token,
  );

  if (response.status === 401) {
    // Es posible que otra solicitud haya renovado
    // el token mientras esta petición estaba en curso.
    let renewedToken = getAccessToken();

    if (!renewedToken || renewedToken === token) {
      try {
        const refreshed = await refreshSession();
        renewedToken = refreshed.accessToken;
      } catch {
        // No borrar una sesión más nueva creada
        // mientras se procesaba esta solicitud.
        if (getAccessToken() === token) {
          clearAccessToken();
        }

        throw new HttpError(
          401,
          'No fue posible renovar la sesión.',
        );
      }
    }

    if (!renewedToken) {
      throw new HttpError(
        401,
        'La sesión no está disponible.',
      );
    }

    // Reintentar una sola vez.
    response = await sendRequest(
      url,
      options,
      renewedToken,
    );

    if (response.status === 401) {
      if (getAccessToken() === renewedToken) {
        clearAccessToken();
      }

      throw new HttpError(
        401,
        'Tu sesión expiró o dejó de ser válida.',
      );
    }
  }

  if (response.status === 403) {
    throw new HttpError(
      403,
      'No tienes permisos para realizar esta operación.',
    );
  }

  if (!response.ok) {
    throw new HttpError(
      response.status,
      `Error HTTP ${response.status}: ${response.statusText}`,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
