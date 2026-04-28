import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RPSArena } from './index';

describe('RPSArena', () => {
    const baseRoom = {
        players: [
            { playerUid: 'u1', name: 'Alpha', role: 'player' },
            { playerUid: 'u2', name: 'Bravo', role: 'player' },
        ]
    };

    const defaultProps: any = {
        room: baseRoom,
        gameState: { playerChoices: {}, readyPlayers: [] },
        playerUid: 'u1',
        opponent: { playerUid: 'u2', name: 'Bravo' },
        isPlayer: true,
        isRoundOver: false,
        handleRPSMove: vi.fn(),
        handleNextRound: vi.fn()
    };

    // ----- basic render -----
    it('should render game options for player', () => {
        render(<RPSArena {...defaultProps} />);
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThanOrEqual(3);
        expect(screen.getByText('🪨')).toBeDefined();
    });

    // ----- move buttons -----
    it('should call handleRPSMove when choices are clicked', () => {
        const handleRPSMove = vi.fn();
        render(<RPSArena {...defaultProps} handleRPSMove={handleRPSMove} />);

        fireEvent.click(screen.getByRole('button', { name: '🪨' }));
        expect(handleRPSMove).toHaveBeenCalledWith('Rock');

        fireEvent.click(screen.getByRole('button', { name: '📄' }));
        expect(handleRPSMove).toHaveBeenCalledWith('Paper');

        fireEvent.click(screen.getByRole('button', { name: '✂️' }));
        expect(handleRPSMove).toHaveBeenCalledWith('Scissors');
    });

    it('should disable move buttons if player has already moved', () => {
        render(<RPSArena {...defaultProps} gameState={{ playerChoices: { u1: 'Rock' }, readyPlayers: [] }} />);
        const rockBtn = screen.getByRole('button', { name: /🪨/i });
        expect(rockBtn).toBeDisabled();
    });

    // ----- myMove icon variants -----
    it('should show 📄 icon for player myMove=Paper', () => {
        render(<RPSArena {...defaultProps} gameState={{ playerChoices: { u1: 'Paper' }, readyPlayers: [] }} />);
        // The large icon in the left panel
        const icons = screen.getAllByText('📄');
        expect(icons.length).toBeGreaterThan(0);
    });

    it('should show ✂️ icon for player myMove=Scissors', () => {
        render(<RPSArena {...defaultProps} gameState={{ playerChoices: { u1: 'Scissors' }, readyPlayers: [] }} />);
        const icons = screen.getAllByText('✂️');
        expect(icons.length).toBeGreaterThan(0);
    });

    it('should show 🔒 icon when myMove=hidden', () => {
        render(<RPSArena {...defaultProps} gameState={{ playerChoices: { u1: 'hidden' }, readyPlayers: [] }} />);
        expect(screen.getAllByText('🔒').length).toBeGreaterThan(0);
    });

    it('should show ❓ icon when no move made', () => {
        render(<RPSArena {...defaultProps} gameState={{ playerChoices: {}, readyPlayers: [] }} />);
        // The left-panel "no move yet" icon
        expect(screen.getAllByText('❓').length).toBeGreaterThan(0);
    });

    // ----- spectator (isPlayer=false) -----
    it('should show COMBATANT ALPHA label when spectating', () => {
        render(<RPSArena {...defaultProps} isPlayer={false} />);
        expect(screen.getByText('COMBATANT ALPHA')).toBeDefined();
    });

    it('should NOT show move buttons for spectator', () => {
        render(<RPSArena {...defaultProps} isPlayer={false} />);
        // No Rock/Paper/Scissors buttons
        const buttons = screen.queryAllByRole('button');
        expect(buttons.length).toBe(0);
    });

    // ----- no opponent -----
    it('should render without opponent (opponent=null)', () => {
        render(<RPSArena {...defaultProps} opponent={null} />);
        expect(screen.getByText('COMBATANT BRAVO')).toBeDefined();
    });

    // ----- opponent move indicator -----
    it('should show STRIKE READY when opponent has moved', () => {
        render(<RPSArena {...defaultProps} gameState={{ playerChoices: { u2: 'hidden' }, readyPlayers: [] }} />);
        expect(screen.getByText('STRIKE READY')).toBeDefined();
    });

    it('should show CALCULATING when opponent has not moved', () => {
        render(<RPSArena {...defaultProps} gameState={{ playerChoices: {}, readyPlayers: [] }} />);
        expect(screen.getByText('CALCULATING')).toBeDefined();
    });

    // ----- round over: WIN -----
    it('should render round over overlay with win result', () => {
        render(<RPSArena
            {...defaultProps}
            isRoundOver={true}
            gameState={{
                playerChoices: { u1: 'Rock', u2: 'Scissors' },
                lastResult: { winnerUid: 'u1', isDraw: false },
                readyPlayers: []
            }}
        />);
        expect(screen.getByText(/Combat Results/i)).toBeDefined();
        expect(screen.getByText(/Alpha DOMINANT/i)).toBeDefined();
        expect(screen.getByText('🏆')).toBeDefined();
    });

    // ----- round over: DRAW -----
    it('should render round over overlay with draw result', () => {
        render(<RPSArena
            {...defaultProps}
            isRoundOver={true}
            gameState={{
                playerChoices: { u1: 'Rock', u2: 'Rock' },
                lastResult: { isDraw: true },
                readyPlayers: []
            }}
        />);
        expect(screen.getByText(/Sync Protocol/i)).toBeDefined();
        expect(screen.getByText(/RESULT: EQUALIZED/i)).toBeDefined();
        expect(screen.getByText('🤝')).toBeDefined();
    });

    // ----- round over: spectator view -----
    it('should show "Waiting for next round..." for spectator during round over', () => {
        render(<RPSArena
            {...defaultProps}
            isPlayer={false}
            isRoundOver={true}
            gameState={{
                playerChoices: {},
                lastResult: { winnerUid: 'u2' },
                readyPlayers: []
            }}
        />);
        expect(screen.getByText(/Waiting for next round/i)).toBeDefined();
    });

    // ----- round over: NEXT ROUND button -----
    it('should show NEXT ROUND button and call handleNextRound', () => {
        const handleNextRound = vi.fn();
        render(<RPSArena
            {...defaultProps}
            isRoundOver={true}
            handleNextRound={handleNextRound}
            gameState={{
                playerChoices: {},
                lastResult: { winnerUid: 'u1' },
                readyPlayers: []
            }}
        />);
        const nextRoundBtn = screen.getByRole('button', { name: /NEXT ROUND/i });
        fireEvent.click(nextRoundBtn);
        expect(handleNextRound).toHaveBeenCalled();
    });

    // ----- round over: player already ready → WAITING -----
    it('should show WAITING when player is in readyPlayers', () => {
        render(<RPSArena
            {...defaultProps}
            isRoundOver={true}
            gameState={{
                playerChoices: {},
                lastResult: { winnerUid: 'u2' },
                readyPlayers: ['u1']
            }}
        />);
        expect(screen.getByRole('button', { name: /WAITING.../i })).toBeDefined();
        expect(screen.getByRole('button', { name: /WAITING.../i })).toBeDisabled();
    });

    // ----- round over: opponent move icons -----
    it('should reveal Rock icon for opponent after round over', () => {
        render(<RPSArena
            {...defaultProps}
            isRoundOver={true}
            gameState={{
                playerChoices: { u1: 'Paper', u2: 'Rock' },
                lastResult: { winnerUid: 'u1' },
                readyPlayers: []
            }}
        />);
        // Both the player icon (📄) and opponent icon (🪨) should appear
        expect(screen.getAllByText('🪨').length).toBeGreaterThan(0);
    });

    it('should reveal Paper icon for opponent after round over', () => {
        render(<RPSArena
            {...defaultProps}
            isRoundOver={true}
            gameState={{
                playerChoices: { u1: 'Scissors', u2: 'Paper' },
                lastResult: { winnerUid: 'u1' },
                readyPlayers: []
            }}
        />);
        expect(screen.getAllByText('📄').length).toBeGreaterThan(0);
    });

    it('should reveal Scissors icon for opponent after round over', () => {
        render(<RPSArena
            {...defaultProps}
            isRoundOver={true}
            gameState={{
                playerChoices: { u1: 'Rock', u2: 'Scissors' },
                lastResult: { winnerUid: 'u1' },
                readyPlayers: []
            }}
        />);
        expect(screen.getAllByText('✂️').length).toBeGreaterThan(0);
    });

    it('should show ❓ for unknown opponent move after round over', () => {
        render(<RPSArena
            {...defaultProps}
            isRoundOver={true}
            gameState={{
                playerChoices: { u1: 'Rock', u2: undefined },
                lastResult: { winnerUid: 'u1' },
                readyPlayers: []
            }}
        />);
        expect(screen.getAllByText('❓').length).toBeGreaterThan(0);
    });
});
