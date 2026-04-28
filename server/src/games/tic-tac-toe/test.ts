import { ticTacToeGameHandler } from './index';

describe('TicTacToe Game Handler', () => {
    it('should provide initial state', () => {
        const state = ticTacToeGameHandler.getInitialState();
        expect(state.status).toBe('waiting-for-players');
        expect(state.board.length).toBe(9);
        expect(state.board.every(cell => cell === null)).toBe(true);
    });

    it('should start game when host is ready', () => {
        const room: any = { 
            id: 'r1', 
            players: [
                { playerUid: 'u1', role: 'player' }, 
                { playerUid: 'u2', role: 'player' }
            ] 
        };
        const state = ticTacToeGameHandler.getInitialState();
        const result = ticTacToeGameHandler.handleReady({ room, gameState: state, playerUid: 'u1' });
        expect(result.newGameState.status).toBe('playing');
        expect(result.newGameState.currentTurn).toBe('u1');
    });

    it('should handle moves and switch turns', () => {
        const room: any = { 
            players: [
                { playerUid: 'u1', role: 'player' }, 
                { playerUid: 'u2', role: 'player' }
            ] 
        };
        const state: any = { 
            status: 'playing', 
            board: Array(9).fill(null), 
            currentTurn: 'u1' 
        };
        
        const result = ticTacToeGameHandler.handleMove({ room, gameState: state, playerUid: 'u1', move: 0 });
        expect(result.newGameState.board[0]).toBe('X');
        expect(result.newGameState.currentTurn).toBe('u2');
    });

    it('should detect winner', () => {
        const room: any = { 
            players: [
                { playerUid: 'u1', role: 'player' }, 
                { playerUid: 'u2', role: 'player' }
            ] 
        };
        const state: any = { 
            status: 'playing', 
            board: ['X', 'X', null, 'O', 'O', null, null, null, null], 
            currentTurn: 'u1' 
        };
        
        const result = ticTacToeGameHandler.handleMove({ room, gameState: state, playerUid: 'u1', move: 2 });
        expect(result.newGameState.winner).toBe('u1');
        expect(result.newGameState.status).toBe('finished');
    });

    it('should detect draw', () => {
        const room: any = { 
            players: [
                { playerUid: 'u1', role: 'player' }, 
                { playerUid: 'u2', role: 'player' }
            ] 
        };
        // Board almost full, no winner
        const state: any = { 
            status: 'playing', 
            board: ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', null], 
            currentTurn: 'u1' 
        };
        
        const result = ticTacToeGameHandler.handleMove({ room, gameState: state, playerUid: 'u1', move: 8 });
        expect(result.newGameState.isDraw).toBe(true);
        expect(result.newGameState.status).toBe('finished');
    });
});
