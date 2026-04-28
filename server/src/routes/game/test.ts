import { registerGameRoutes } from './index';
import { GameController } from '../../controllers/game';
import { Server } from 'socket.io';

describe('GameRoutes', () => {
    let mockIo: jest.Mocked<Server>;
    let mockSocket: any;
    let mockController: jest.Mocked<GameController>;

    beforeEach(() => {
        mockIo = {} as any;
        mockSocket = {
            on: jest.fn(),
            id: 'socket-id'
        };
        mockController = {
            handleReady: jest.fn(),
            handleMove: jest.fn(),
        } as any;
    });

    it('should register game events', () => {
        registerGameRoutes(mockIo, mockSocket, mockController);
        expect(mockSocket.on).toHaveBeenCalledWith('game-ready', expect.any(Function));
        expect(mockSocket.on).toHaveBeenCalledWith('game-move', expect.any(Function));
    });

    it('should delegate to controller', () => {
        registerGameRoutes(mockIo, mockSocket, mockController);

        const handlers: Record<string, Function> = {};
        (mockSocket.on as jest.Mock).mock.calls.forEach(([event, handler]) => {
            handlers[event] = handler;
        });

        handlers['game-ready']({ roomId: 'r1' });
        expect(mockController.handleReady).toHaveBeenCalledWith(mockSocket, { roomId: 'r1' });

        handlers['game-move']({ roomId: 'r1', move: 'X' });
        expect(mockController.handleMove).toHaveBeenCalledWith(mockSocket, { roomId: 'r1', move: 'X' });
    });
});
