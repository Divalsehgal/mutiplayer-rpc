import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import RoomScreen from './index';
import { BrowserRouter } from 'react-router-dom';
import { useRoomLogic } from '../../hooks/useRoomLogic';

vi.mock('../../hooks/useRoomLogic', () => ({
    useRoomLogic: vi.fn(),
}));

describe('RoomScreen', () => {
    it('should render loading state initially', () => {
        vi.mocked(useRoomLogic).mockReturnValue({ room: undefined });
        render(<BrowserRouter><RoomScreen /></BrowserRouter>);
        expect(document.querySelector('.animate-spin')).toBeDefined();
    });

    it('should render expired state when room is null', () => {
        vi.mocked(useRoomLogic).mockReturnValue({ room: null });
        render(<BrowserRouter><RoomScreen /></BrowserRouter>);
        expect(screen.getByText(/Lobby Expired/i)).toBeDefined();
    });

    it('should render room details when room exists', () => {
        const mockRoom = {
            id: 'room123',
            gameType: 'RPS',
            maxPlayers: 2,
            status: 'waiting',
            players: [
                { playerUid: 'u1', name: 'Host', role: 'player', status: 'online' },
                { playerUid: 'u2', name: 'Guest', role: 'player', status: 'online' }
            ]
        };
        vi.mocked(useRoomLogic).mockReturnValue({
            room: mockRoom,
            playerUid: 'u1',
            ttlWarning: false,
            handleStartGame: vi.fn(),
            handleExtendSession: vi.fn(),
            handleLeave: vi.fn()
        });

        render(<BrowserRouter><RoomScreen /></BrowserRouter>);
        expect(screen.getByText(/PRE-MATCH LOBBY/i)).toBeDefined();
        expect(screen.getAllByText(/Host/i).length).toBeGreaterThan(0);
        expect(screen.getByText(/Guest/i)).toBeDefined();
    });

    it('should render initializing state when status is playing', () => {
        vi.mocked(useRoomLogic).mockReturnValue({
            room: { status: 'playing', players: [] },
            playerUid: 'u1'
        });
        render(<BrowserRouter><RoomScreen /></BrowserRouter>);
        expect(screen.getByText(/Match Initializing/i)).toBeDefined();
    });
});
