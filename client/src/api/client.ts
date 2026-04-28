import { useAuthStore } from '../store/auth';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3030';

interface RequestOptions extends RequestInit {
  retry?: boolean;
}

// Lock to prevent multiple simultaneous refreshes
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

export async function apiFetch(endpoint: string, options: RequestOptions = {}): Promise<{ ok: boolean; status: number; data: unknown }> {
  const { accessToken, setAuth, logout } = useAuthStore.getState();
  
  const headers = new Headers(options.headers || {});
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }
  if (options.body && !headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const url = `${SERVER_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (response.status === 401 && !options.retry) {
    if (isRefreshing) {
      // Wait for the current refresh to finish
      return new Promise((resolve) => {
        subscribeTokenRefresh((newToken) => {
          const retryOptions = { ...options };
          retryOptions.headers = new Headers(options.headers);
          retryOptions.headers.set('Authorization', `Bearer ${newToken}`);
          resolve(apiFetch(endpoint, { ...retryOptions, retry: true }));
        });
      });
    }

    isRefreshing = true;

    try {
      const refreshRes = await fetch(`${SERVER_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      const refreshData = await refreshRes.json();

      if (refreshData.success) {
        const { accessToken: newAccessToken } = refreshData.data;
        // Only update the token, keep current user
        setAuth(useAuthStore.getState().user!, newAccessToken);
        isRefreshing = false;
        onTokenRefreshed(newAccessToken);
        return apiFetch(endpoint, { ...options, retry: true });
      }
    } catch (refreshErr) {
      isRefreshing = false;
      logout();
      window.location.href = '/login';
      throw new Error('Session expired');
    }
  }

  const data = await response.json().catch(() => null);
  
  return { ok: response.ok, status: response.status, data };
}
