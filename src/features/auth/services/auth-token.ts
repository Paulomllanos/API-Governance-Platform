
let accessToken: string | null = null;

const listeners = new Set<() => void>();

export function setAccessToken(
  token: string,
): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function clearAccessToken(): void {
  accessToken = null;

  for (const listener of listeners) {
    listener();
  }
}

export function subscribeToSessionCleared(
  listener: () => void,
): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}
