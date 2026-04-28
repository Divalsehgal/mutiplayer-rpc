import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import AuthScreen from './index';
import { BrowserRouter } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';

import { apiFetch } from '../../api/client';

vi.mock('../../store/auth', () => ({
  useAuthStore: vi.fn(),
}));

const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual as any,
    useNavigate: () => mockedNavigate,
  };
});

vi.mock('../../api/client', () => ({
  apiFetch: vi.fn(),
}));

vi.mock('@react-oauth/google', () => ({
  GoogleLogin: ({ onSuccess, onError }: any) => (
    <div data-testid="google-login">
        <button onClick={() => onSuccess({ credential: 'mock_token' })}>Success</button>
        <button onClick={() => onError()}>Error</button>
    </div>
  ),
}));

describe('AuthScreen', () => {
    beforeEach(() => {
        vi.mocked(useAuthStore).mockReturnValue({
            isAuthenticated: false,
            isLoading: false,
            setError: vi.fn(),
            error: null,
            googleLogin: vi.fn(),
            setAuth: vi.fn(),
            logout: vi.fn(),
        } as any);
        vi.mocked(apiFetch).mockResolvedValue({ ok: true, data: {} });
        vi.clearAllMocks();
    });
    it('should render sign in form by default', () => {
        vi.mocked(useAuthStore).mockReturnValue({
            isAuthenticated: false,
            isLoading: false,
            setError: vi.fn(),
            error: null,
            googleLogin: vi.fn(),
            setAuth: vi.fn()
        });

        render(<BrowserRouter><AuthScreen /></BrowserRouter>);
        expect(screen.getByText(/Welcome Back/i)).toBeDefined();
    });

    it('should switch to sign up form', () => {
        vi.mocked(useAuthStore).mockReturnValue({
            isAuthenticated: false,
            isLoading: false,
            setError: vi.fn(),
            error: null
        });

        render(<BrowserRouter><AuthScreen /></BrowserRouter>);
        const signUpTab = screen.getByRole('button', { name: /Sign Up/i });
        fireEvent.click(signUpTab);
        expect(screen.getByText(/Join the Arena/i)).toBeDefined();
        expect(screen.getByPlaceholderText(/your_cool_name/i)).toBeDefined();
    });

    it('should update form data on input change', () => {
        vi.mocked(useAuthStore).mockReturnValue({
            isAuthenticated: false,
            isLoading: false,
            setError: vi.fn(),
            error: null
        });

        render(<BrowserRouter><AuthScreen /></BrowserRouter>);
        const emailInput = screen.getByPlaceholderText(/hero@example.com/i) as HTMLInputElement;
        fireEvent.change(emailInput, { target: { value: 'test@test.com', name: 'email' } });
        expect(emailInput.value).toBe('test@test.com');
    });

    it('should call setAuth on sign in submit', async () => {
        const setAuth = vi.fn();
        vi.mocked(useAuthStore).mockReturnValue({
            isAuthenticated: false,
            isLoading: false,
            setError: vi.fn(),
            error: null,
            setAuth
        });

        const { container } = render(<BrowserRouter><AuthScreen /></BrowserRouter>);
        const emailInput = screen.getByPlaceholderText(/hero@example.com/i);
        const passwordInput = screen.getByPlaceholderText(/••••••••/i);
        
        fireEvent.change(emailInput, { target: { value: 'test@test.com', name: 'email' } });
        fireEvent.change(passwordInput, { target: { value: 'password123', name: 'password' } });
        
        const signInButton = container.querySelector('button[type="submit"]');
        fireEvent.click(signInButton!);
    });

    it('should handle sign up submit', async () => {
        vi.mocked(useAuthStore).mockReturnValue({
            isAuthenticated: false,
            isLoading: false,
            setError: vi.fn(),
            error: null
        });

        const { container } = render(<BrowserRouter><AuthScreen /></BrowserRouter>);
        
        // Switch to sign up
        const signUpTab = screen.getByRole('button', { name: /Sign Up/i });
        fireEvent.click(signUpTab);

        const nameInput = screen.getByPlaceholderText(/your_cool_name/i);
        const emailInput = screen.getByPlaceholderText(/hero@example.com/i);
        const passwordInput = screen.getByPlaceholderText(/••••••••/i);
        
        fireEvent.change(nameInput, { target: { value: 'Tester', name: 'user_name' } });
        fireEvent.change(emailInput, { target: { value: 'test@test.com', name: 'email' } });
        fireEvent.change(passwordInput, { target: { value: 'password123', name: 'password' } });
        
        const signUpButton = container.querySelector('button[type="submit"]');
        fireEvent.click(signUpButton!);
    });

    it('should handle Google login success', async () => {
        const googleLogin = vi.fn();
        vi.mocked(useAuthStore).mockReturnValue({
            isAuthenticated: false,
            isLoading: false,
            setError: vi.fn(),
            error: null,
            googleLogin
        });

        render(<BrowserRouter><AuthScreen /></BrowserRouter>);
        const successButton = screen.getByText('Success');
        fireEvent.click(successButton);
        
        expect(googleLogin).toHaveBeenCalledWith('mock_token');
    });

    it('should handle Google login error', async () => {
        const setError = vi.fn();
        vi.mocked(useAuthStore).mockReturnValue({
            isAuthenticated: false,
            isLoading: false,
            setError,
            error: null,
            googleLogin: vi.fn()
        });

        render(<BrowserRouter><AuthScreen /></BrowserRouter>);
        const errorButton = screen.getByText('Error');
        fireEvent.click(errorButton);
        
        expect(setError).toHaveBeenCalledWith('Google login failed');
    });

    it('should show error on apiFetch failure', async () => {
        const setError = vi.fn();
        vi.mocked(apiFetch).mockResolvedValue({ ok: false, data: { message: 'Wrong password' } });

        vi.mocked(useAuthStore).mockReturnValue({
            isAuthenticated: false,
            isLoading: false,
            setError,
            error: null
        });

        const { container } = render(<BrowserRouter><AuthScreen /></BrowserRouter>);

        const emailInput = screen.getByPlaceholderText(/hero@example.com/i);
        const passwordInput = screen.getByPlaceholderText(/••••••••/i);
        
        fireEvent.change(emailInput, { target: { value: 'test@test.com', name: 'email' } });
        fireEvent.change(passwordInput, { target: { value: 'wrong', name: 'password' } });

        const signInButton = container.querySelector('button[type="submit"]');
        fireEvent.click(signInButton!);
        
        await waitFor(() => expect(setError).toHaveBeenCalledWith('Wrong password'));
    });

    it('should handle successful login', async () => {
        const setAuth = vi.fn();

        vi.mocked(apiFetch).mockResolvedValue({ 
            ok: true, 
            data: { 
                success: true, 
                data: { user: { id: 'u1' }, accessToken: 't1' } 
            } 
        });

        vi.mocked(useAuthStore).mockReturnValue({
            isAuthenticated: false,
            isLoading: false,
            setError: vi.fn(),
            error: null,
            setAuth,
        } as any);

        const { container } = render(<BrowserRouter><AuthScreen /></BrowserRouter>);
        
        fireEvent.change(screen.getByPlaceholderText(/hero@example.com/i), { target: { value: 'test@test.com', name: 'email' } });
        fireEvent.change(screen.getByPlaceholderText(/••••••••/i), { target: { value: 'password', name: 'password' } });

        const signInButton = container.querySelector('button[type="submit"]');
        await act(async () => {
            fireEvent.click(signInButton!);
        });
        
        await waitFor(() => expect(apiFetch).toHaveBeenCalled());
        await waitFor(() => expect(setAuth).toHaveBeenCalledWith({ id: 'u1' }, 't1'));
        expect(mockedNavigate).toHaveBeenCalledWith('/');
    });
});
