import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import LobbyScreen from './index';
import { BrowserRouter } from 'react-router-dom';
import { socket } from '../../api/socket';

vi.mock('../../api/socket', () => ({
  socket: {
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  },
  getPlayerUid: () => 'uid123',
}));

describe('LobbyScreen', () => {
    it('should render correctly', () => {
        render(
            <BrowserRouter>
                <LobbyScreen />
            </BrowserRouter>
        );
        expect(screen.getByText(/ARENA SETTINGS/i)).toBeDefined();
        expect(screen.getAllByText(/GLOBAL PORTAL/i)).toBeDefined();
    });

    it('should allow entering a player name', () => {
        render(
            <BrowserRouter>
                <LobbyScreen />
            </BrowserRouter>
        );
        const nameInput = screen.getByPlaceholderText(/YOUR ALIAS/i) as HTMLInputElement;
        fireEvent.change(nameInput, { target: { value: 'John Doe' } });
        expect(nameInput.value).toBe('John Doe');
    });

    it('should have the start match button disabled when name is too short', () => {
        render(
            <BrowserRouter>
                <LobbyScreen />
            </BrowserRouter>
        );
        
        const startMatchButton = screen.getByRole('button', { name: /START MATCH/i }) as HTMLButtonElement;
        expect(startMatchButton.disabled).toBe(true);
    });

    it('should allow joining a room via room code', () => {
        render(
            <BrowserRouter>
                <LobbyScreen />
            </BrowserRouter>
        );
        const nameInput = screen.getByPlaceholderText(/YOUR ALIAS/i);
        fireEvent.change(nameInput, { target: { value: 'John' } });
        
        const codeInput = screen.getByPlaceholderText(/ROOM CODE/i) as HTMLInputElement;
        fireEvent.change(codeInput, { target: { value: 'ABCD' } });
        expect(codeInput.value).toBe('ABCD');
        
        const joinButton = screen.getByText(/JOIN/i);
        fireEvent.click(joinButton);
    });

    it('should refresh public rooms via socket', () => {
        let callback: any;
        (socket.emit as any).mockImplementation((event: string, cb: any) => {
            if (event === 'get-public-rooms') callback = cb;
        });

        render(
            <BrowserRouter>
                <LobbyScreen />
            </BrowserRouter>
        );

        act(() => {
            callback({ ok: true, rooms: [{ id: 'room123', hostName: 'Host', players: [], maxPlayers: 2, gameType: 'RPS' }] });
        });

        expect(screen.getByText(/Host's Room/i)).toBeDefined();
    });

    it('should call socket.emit when START MATCH is clicked', () => {
        render(
            <BrowserRouter>
                <LobbyScreen />
            </BrowserRouter>
        );
        const nameInput = screen.getByPlaceholderText(/YOUR ALIAS/i);
        fireEvent.change(nameInput, { target: { value: 'John' } });
        
        const startMatchButton = screen.getByRole('button', { name: /START MATCH/i });
        fireEvent.click(startMatchButton);
        
        expect(socket.emit).toHaveBeenCalledWith('register', expect.anything(), expect.anything());
    });

    it('should allow changing game type', () => {
        render(
            <BrowserRouter>
                <LobbyScreen />
            </BrowserRouter>
        );
        const gameButton = screen.getByText(/Snakes & Ladders/i);
        fireEvent.click(gameButton);
        // Visual state change should happen
    });

    it('should allow changing visibility', () => {
        render(
            <BrowserRouter>
                <LobbyScreen />
            </BrowserRouter>
        );
        const changeButton = screen.getByText(/Change/i);
        fireEvent.click(changeButton);
        expect(screen.getByText(/Private Match/i)).toBeDefined();
    });

    it('should handle create room error', () => {
        let registerCallback: any;
        let createCallback: any;
        (socket.emit as any).mockImplementation((event: string, data: any, cb: any) => {
            if (event === 'register') registerCallback = typeof data === 'function' ? data : cb;
            if (event === 'create-room') createCallback = cb;
        });

        window.alert = vi.fn();

        render(
            <BrowserRouter>
                <LobbyScreen />
            </BrowserRouter>
        );
        
        fireEvent.change(screen.getByPlaceholderText(/YOUR ALIAS/i), { target: { value: 'John' } });
        fireEvent.click(screen.getByRole('button', { name: /START MATCH/i }));

        act(() => {
            if (registerCallback) registerCallback();
        });

        act(() => {
            if (createCallback) createCallback({ ok: false, error: 'Creation failed' });
        });

        expect(window.alert).toHaveBeenCalledWith('Creation failed');
    });
});
