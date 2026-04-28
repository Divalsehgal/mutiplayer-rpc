import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import GameScreen from './index';
import { BrowserRouter } from 'react-router-dom';
import { useGameLogic } from '../../hooks/useGameLogic';

vi.mock('../../hooks/useGameLogic', () => ({
    useGameLogic: vi.fn(),
}));

describe('GameScreen', () => {
    it('should render loading state initially', () => {
        vi.mocked(useGameLogic).mockReturnValue({ room: undefined });
        render(<BrowserRouter><GameScreen /></BrowserRouter>);
        expect(document.querySelector('.animate-spin')).toBeDefined();
    });

    it('should render abandoned state when room is null', () => {
        vi.mocked(useGameLogic).mockReturnValue({ room: null });
        render(<BrowserRouter><GameScreen /></BrowserRouter>);
        expect(screen.getByText(/Match Abandoned/i)).toBeDefined();
    });

    it('should render Arena when room exists', () => {
        const mockRoom = {
            id: 'room1',
            gameType: 'RPS',
            status: 'playing',
            players: [
                { playerUid: 'u1', name: 'P1', role: 'player' },
                { playerUid: 'u2', name: 'P2', role: 'player' }
            ],
            gameState: { status: 'playing' }
        };
        vi.mocked(useGameLogic).mockReturnValue({
            room: mockRoom,
            playerUid: 'u1'
        });

        render(<BrowserRouter><GameScreen /></BrowserRouter>);
        // Check for some header text or arena specific text
        expect(screen.getByText(/P1/i)).toBeDefined();
    });
});
