import { useAuthStore } from '../store/auth';

const rawServerUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3030';
const SERVER_URL = rawServerUrl.replace(/\/+$/, '');

interface RequestOptions extends RequestInit {
  retry?: boolean;
}

let refreshPromise: Promise<boolean> | null = null;

async function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = fetch(`${SERVER_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
      .then(async (refreshRes) => {
        const refreshData = await refreshRes.json().catch(() => null);
        return refreshRes.ok && refreshData?.success === true;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

export async function apiFetch(endpoint: string, options: RequestOptions = {}): Promise<{ ok: boolean; status: number; data: unknown }> {
  const { accessToken, logout } = useAuthStore.getState();

  const headers = new Headers(options.headers || {});
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }
  if (options.body && !headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const requestEndpoint = endpoint.replace(/^\/+/, "");
  const url = new URL(requestEndpoint, `${SERVER_URL}/`).toString();

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  const shouldAttemptRefresh = response.status === 401
    && !options.retry
    && requestEndpoint !== 'auth/refresh'
    && requestEndpoint !== 'auth/logout';

  if (shouldAttemptRefresh) {
    try {
      const refreshed = await refreshSession();
      if (refreshed) {
        return apiFetch(endpoint, { ...options, retry: true });
      }
      throw new Error('Session expired');
    } catch {
      logout();
      throw new Error('Session expired');
    }
  }

  const data = await response.json().catch(() => null);

  return { ok: response.ok, status: response.status, data };
}
