import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SnakeLadderArena } from './index';

describe('SnakeLadderArena', () => {
    const defaultProps: any = {
        room: { 
            players: [
                { playerUid: 'u1', name: 'Alpha', role: 'player' }, 
                { playerUid: 'u2', name: 'Bravo', role: 'player' }
            ] 
        },
        gameState: { 
            positions: { 'u1': 1, 'u2': 1 }, 
            currentTurn: 'u1', 
            logs: ['Game started'] 
        },
        playerUid: 'u1',
        isPlayer: true,
        handleSnakeLadderMove: vi.fn(),
        handleNextRound: vi.fn()
    };

    it('should render roll button for active player', () => {
        render(<SnakeLadderArena {...defaultProps} />);
        const rollButton = screen.getByRole('button', { name: /ROLL/i });
        expect(rollButton).toBeDefined();
        expect(rollButton).not.toBeDisabled();
    });

    it('should disable roll button if not player turn', () => {
        const props = { 
            ...defaultProps, 
            gameState: { ...defaultProps.gameState, currentTurn: 'u2' } 
        };
        render(<SnakeLadderArena {...props} />);
        expect(screen.getByText(/WAIT/i)).toBeDefined();
        expect(screen.getByText(/WAIT/i).closest('button')).toBeDisabled();
    });

    it('should call handleSnakeLadderMove when ROLL is clicked', () => {
        render(<SnakeLadderArena {...defaultProps} />);
        fireEvent.click(screen.getByRole('button', { name: /ROLL/i }));
        expect(defaultProps.handleSnakeLadderMove).toHaveBeenCalled();
    });

    it('should show logs', () => {
        render(<SnakeLadderArena {...defaultProps} />);
        expect(screen.getByText(/Game started/i)).toBeDefined();
    });

    it('should render winner overlay when game ends', () => {
        const props = { 
            ...defaultProps, 
            gameState: { ...defaultProps.gameState, winner: 'u1' } 
        };
        render(<SnakeLadderArena {...props} />);
        expect(screen.getByText(/Victory Protocol/i)).toBeDefined();
        expect(screen.getByText(/Alpha ASCENDED/i)).toBeDefined();
        
        // Test handleNextRound
        const rematchButton = screen.getByRole('button', { name: /REMATCH/i });
        fireEvent.click(rematchButton);
        expect(defaultProps.handleNextRound).toHaveBeenCalled();
    });

    it('should show WAITING state when ready for next round', () => {
        const props = { 
            ...defaultProps, 
            gameState: { ...defaultProps.gameState, winner: 'u1', readyPlayers: ['u1'] } 
        };
        render(<SnakeLadderArena {...props} />);
        expect(screen.getByRole('button', { name: /WAITING/i })).toBeDisabled();
    });

    it('should render correctly for spectator', () => {
        const props = { 
            ...defaultProps, 
            isPlayer: false,
            gameState: { ...defaultProps.gameState, winner: 'u1' } 
        };
        render(<SnakeLadderArena {...props} />);
        expect(screen.getByText(/Waiting for next cycle/i)).toBeDefined();
    });

    it('should handle undefined logs and positions', () => {
        const props = { 
            ...defaultProps, 
            gameState: { currentTurn: 'u1' } 
        };
        render(<SnakeLadderArena {...props} />);
        expect(screen.getByRole('button', { name: /ROLL/i })).toBeDefined();
    });
});
