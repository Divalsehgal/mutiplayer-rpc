import { create } from 'zustand';
import { apiFetch } from '../../api/client';

interface User {
  _id?: string;
  id: string;
  user_name: string;
  email: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setAuth: (user: User, accessToken: string) => void;
  logout: () => void;
  setError: (error: string | null) => void;
  googleLogin: (idToken: string) => Promise<void>;
  checkAuth: () => Promise<void>;
}

interface AuthResponse {
  success: boolean;
  message?: string;
  data: {
    user: User;
    accessToken: string;
  };
}

interface ProfileResponse {
  success: boolean;
  message?: string;
  data: User;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  setAuth: (user, accessToken) => set({ 
    user, 
    accessToken, 
    isAuthenticated: true, 
    error: null 
  }),

  logout: async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      set({ user: null, accessToken: null, isAuthenticated: false, error: null });
    }
  },

  setError: (error) => set({ error }),

  googleLogin: async (idToken: string) => {
    set({ isLoading: true, error: null });
    try {
      const { ok, data } = await apiFetch('/auth/google', {
        method: 'POST',
        body: JSON.stringify({ idToken })
      }) as { ok: boolean; status: number; data: AuthResponse };
      
      if (ok && data.success) {
        const { user, accessToken } = data.data;
        set({ user, accessToken, isAuthenticated: true, isLoading: false });
      } else {
        set({ error: data?.message || 'Google login failed', isLoading: false });
      }
    } catch (err: unknown) {
      set({ 
        error: err instanceof Error ? err.message : 'Google login failed', 
        isLoading: false 
      });
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const { ok, data } = await apiFetch('/user/profile') as { ok: boolean; status: number; data: ProfileResponse };
      if (ok && data.success) {
        set({ 
          user: data.data, 
          isAuthenticated: true, 
          isLoading: false 
        });
      } else {
        set({ isAuthenticated: false, isLoading: false });
      }
    } catch (err) {
      set({ isAuthenticated: false, isLoading: false });
    }
  }
}));
