import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuthStore } from './index';
import { apiFetch } from '../api/client';

vi.mock('../api/client', () => ({
  apiFetch: vi.fn(),
}));

describe('authStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  });

  it('should initialize with default values', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('should setAuth correctly', () => {
    const mockUser = { id: '1', user_name: 'test', email: 'test@test.com' };
    const mockToken = 'token123';
    
    useAuthStore.getState().setAuth(mockUser, mockToken);
    
    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.accessToken).toBe(mockToken);
    expect(state.isAuthenticated).toBe(true);
  });

  it('should logout and clear state', async () => {
    (apiFetch as any).mockResolvedValue({ ok: true });
    useAuthStore.setState({ isAuthenticated: true, user: { id: '1' } as any });
    
    await useAuthStore.getState().logout();
    
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });

  it('should handle googleLogin failure', async () => {
    (apiFetch as any).mockResolvedValue({ ok: false, data: { message: 'Wrong token' } });
    
    await useAuthStore.getState().googleLogin('bad_token');
    
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.error).toBe('Wrong token');
  });

  it('should checkAuth successfully', async () => {
    const mockUser = { id: '1', user_name: 'test' };
    (apiFetch as any).mockResolvedValue({ 
      ok: true, 
      data: { success: true, data: mockUser } 
    });
    
    await useAuthStore.getState().checkAuth();
    
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(mockUser);
  });

  it('should handle checkAuth failure', async () => {
    (apiFetch as any).mockResolvedValue({ ok: false });
    
    await useAuthStore.getState().checkAuth();
    
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
  });

  it('should handle logout error', async () => {
    (apiFetch as any).mockRejectedValue(new Error('Logout failed'));
    useAuthStore.setState({ isAuthenticated: true });
    await useAuthStore.getState().logout();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('should handle googleLogin success', async () => {
    (apiFetch as any).mockResolvedValue({
        ok: true,
        data: { success: true, data: { user: { id: 'u1' }, accessToken: 't1' } }
    });
    await useAuthStore.getState().googleLogin('id-token');
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it('should handle googleLogin throw', async () => {
    (apiFetch as any).mockRejectedValue(new Error('Network error'));
    await useAuthStore.getState().googleLogin('id-token');
    expect(useAuthStore.getState().error).toBe('Network error');
  });

  it('should handle checkAuth throw', async () => {
    (apiFetch as any).mockRejectedValue(new Error('Auth check failed'));
    await useAuthStore.getState().checkAuth();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});
