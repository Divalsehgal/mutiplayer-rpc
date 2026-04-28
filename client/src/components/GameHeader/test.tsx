import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GameHeader } from './index';

describe('GameHeader', () => {
    const defaultProps: any = {
        room: { 
            status: 'playing', 
            gameState: { roundCount: 1 } 
        },
        playerUid: 'u1',
        player: { name: 'Alpha', score: 5 },
        opponent: { name: 'Bravo', score: 3 },
        isSpectator: false
    };

    it('should render player and opponent scores', () => {
        render(<GameHeader {...defaultProps} />);
        expect(screen.getByText('5')).toBeDefined();
        expect(screen.getByText('3')).toBeDefined();
    });

    it('should show player and opponent names', () => {
        render(<GameHeader {...defaultProps} />);
        expect(screen.getByText(/Alpha/i)).toBeDefined();
        expect(screen.getByText(/Bravo/i)).toBeDefined();
    });

    it('should show round count', () => {
        render(<GameHeader {...defaultProps} />);
        expect(screen.getByText(/R1/i)).toBeDefined();
    });

    it('should show game status', () => {
        render(<GameHeader {...defaultProps} />);
        expect(screen.getByText(/PLAYING/i)).toBeDefined();
    });

    it('should render nothing if room or gameState is missing', () => {
        const { container } = render(<GameHeader room={null} playerUid="u1" player={undefined} opponent={undefined} />);
        expect(container.firstChild).toBeNull();
    });
});
