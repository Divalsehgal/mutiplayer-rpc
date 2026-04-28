import { GameController } from './index';

describe('GameController', () => {
    let controller: GameController;
    let mockIo: any;
    let mockGameService: any;
    let mockRepo: any;
    let mockSocket: any;

    beforeEach(() => {
        mockIo = { to: jest.fn().mockReturnThis(), emit: jest.fn() };
        mockGameService = { 
            handleReady: jest.fn(), 
            handleMove: jest.fn(), 
            getPublicRoomState: jest.fn() 
        };
        mockRepo = { getRoom: jest.fn() };
        mockSocket = { data: { playerUid: 'u1' } };
        controller = new GameController(mockIo, mockGameService, mockRepo);
    });

    it('should handle ready and broadcast update', () => {
        mockGameService.handleReady.mockReturnValue({ gameState: {} });
        mockGameService.getPublicRoomState.mockReturnValue({ id: 'r1' });
        mockRepo.getRoom.mockReturnValue({ 
            players: [{ socketId: 's1', playerUid: 'u1' }] 
        });
        
        controller.handleReady(mockSocket, { roomId: 'r1' });
        
        expect(mockGameService.handleReady).toHaveBeenCalledWith('r1', 'u1');
        expect(mockIo.to).toHaveBeenCalledWith('s1');
        expect(mockIo.emit).toHaveBeenCalledWith('room-update', expect.anything());
    });

    it('should handle move and broadcast update', () => {
        mockGameService.handleMove.mockReturnValue({ gameState: {} });
        mockGameService.getPublicRoomState.mockReturnValue({ id: 'r1' });
        mockRepo.getRoom.mockReturnValue({ 
            players: [{ socketId: 's1', playerUid: 'u1' }] 
        });
        
        controller.handleMove(mockSocket, { roomId: 'r1', move: 'Rock' });
        
        expect(mockGameService.handleMove).toHaveBeenCalledWith('r1', 'u1', 'Rock');
        expect(mockIo.to).toHaveBeenCalledWith('s1');
    });

    it('should do nothing if room not found during broadcast', () => {
        mockGameService.handleReady.mockReturnValue({ gameState: {} });
        mockRepo.getRoom.mockReturnValue(null);
        
        controller.handleReady(mockSocket, { roomId: 'r1' });
        
        expect(mockIo.to).not.toHaveBeenCalled();
    });

    it('should handle move error', () => {
        mockGameService.handleMove.mockReturnValue(null);
        controller.handleMove(mockSocket, { roomId: 'r1', move: 'Rock' });
        expect(mockIo.to).not.toHaveBeenCalled();
    });
});
