import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TicTacToeArena } from './index';

describe('TicTacToeArena', () => {
    const defaultProps: any = {
        room: { 
            players: [
                { playerUid: 'u1', name: 'Alpha', role: 'player' }, 
                { playerUid: 'u2', name: 'Bravo', role: 'player' }
            ] 
        },
        gameState: { 
            board: Array(9).fill(null), 
            currentTurn: 'u1' 
        },
        playerUid: 'u1',
        isPlayer: true,
        handleTicTacToeMove: vi.fn(),
        handleNextRound: vi.fn()
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render 9 grid cells', () => {
        render(<TicTacToeArena {...defaultProps} />);
        const cells = screen.getAllByText(/N-0/i);
        expect(cells.length).toBe(9);
    });

    it('should call handleTicTacToeMove when empty cell is clicked during player turn', () => {
        render(<TicTacToeArena {...defaultProps} />);
        const firstCell = screen.getByText('N-00').parentElement;
        fireEvent.click(firstCell!);
        expect(defaultProps.handleTicTacToeMove).toHaveBeenCalledWith(0);
    });

    it('should not call handleTicTacToeMove when cell is already occupied', () => {
        const props = { 
            ...defaultProps, 
            gameState: { ...defaultProps.gameState, board: ['X', null, null, null, null, null, null, null, null] } 
        };
        render(<TicTacToeArena {...props} />);
        const firstCell = screen.getByText('X').parentElement;
        if (firstCell) fireEvent.click(firstCell);
        expect(props.handleTicTacToeMove).not.toHaveBeenCalled();
    });

    it('should render X and O symbols', () => {
        const props = { 
            ...defaultProps, 
            gameState: { 
                board: ['X', 'O', null, null, null, null, null, null, null], 
                currentTurn: 'u1' 
            } 
        };
        render(<TicTacToeArena {...props} />);
        expect(screen.getByText('X')).toBeDefined();
        expect(screen.getByText('O')).toBeDefined();
    });

    it('should show winner overlay', () => {
        const props = { 
            ...defaultProps, 
            gameState: { 
                board: ['X', 'X', 'X', 'O', 'O', null, null, null, null], 
                winner: 'u1' 
            } 
        };
        render(<TicTacToeArena {...props} />);
        expect(screen.getByText(/Grid Dominance/i)).toBeDefined();
        expect(screen.getByText(/Alpha ASCENDED/i)).toBeDefined();
    });

    it('should log error if board is missing', () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const props = { 
            ...defaultProps, 
            gameState: { currentTurn: 'u1', board: null } 
        };
        render(<TicTacToeArena {...props} />);
        expect(consoleSpy).toHaveBeenCalledWith("TicTacToe Error: Board is missing from gameState", props.gameState);
        consoleSpy.mockRestore();
    });
});
