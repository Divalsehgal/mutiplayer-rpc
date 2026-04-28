import { RoomController } from './index';

describe('RoomController', () => {
    let controller: RoomController;
    let mockIo: any;
    let mockRoomService: any;
    let mockGameService: any;
    let mockRoomRepository: any;
    let mockSocket: any;

    beforeEach(() => {
        mockIo = { to: jest.fn().mockReturnThis(), emit: jest.fn() };
        mockRoomService = { 
            createRoom: jest.fn(), 
            joinRoom: jest.fn(), 
            leaveRoom: jest.fn(),
            extendRoom: jest.fn()
        };
        mockGameService = { getPublicRoomState: jest.fn() };
        mockRoomRepository = { getRoom: jest.fn(), serializeRoom: jest.fn(), getPublicRooms: jest.fn() };
        mockSocket = { id: 'socket123', data: { playerUid: 'user123' }, join: jest.fn(), leave: jest.fn() };
        
        controller = new RoomController(mockIo, mockRoomService, mockGameService, mockRoomRepository);
    });

    it('should create a room and join socket to it', () => {
        const mockRoom = { id: 'room1' };
        mockRoomService.createRoom.mockReturnValue(mockRoom);
        mockRoomRepository.serializeRoom.mockReturnValue({ id: 'room1' });
        const callback = jest.fn();

        controller.createRoom(mockSocket, { hostName: 'Host', gameType: 'RPS' }, callback);

        expect(mockSocket.join).toHaveBeenCalledWith('room1');
        expect(callback).toHaveBeenCalledWith({ ok: true, roomId: 'room1', room: { id: 'room1' } });
    });

    it('should handle errors in createRoom', () => {
        mockRoomService.createRoom.mockImplementation(() => { throw new Error('Failed'); });
        const callback = jest.fn();

        controller.createRoom(mockSocket, { hostName: 'Host', gameType: 'RPS' }, callback);

        expect(callback).toHaveBeenCalledWith({ ok: false, error: 'Failed' });
    });

    it('should allow joining a room', () => {
        const mockRoom = { id: 'room1', players: [{ playerUid: 'u1', socketId: 'socket123' }] };
        mockRoomService.joinRoom.mockReturnValue({ room: mockRoom });
        mockRoomRepository.getRoom.mockReturnValue(mockRoom);
        mockGameService.getPublicRoomState.mockReturnValue({ id: 'room1', players: [] });
        const callback = jest.fn();

        controller.joinRoom(mockSocket, { roomId: 'room1', name: 'Player' }, callback);

        expect(mockSocket.join).toHaveBeenCalledWith('room1');
        expect(callback).toHaveBeenCalledWith({ ok: true, room: expect.any(Object) });
        expect(mockIo.to).toHaveBeenCalledWith('socket123');
        expect(mockIo.to().emit).toHaveBeenCalledWith('room-update', expect.any(Object));
    });

    it('should allow leaving a room', () => {
        mockRoomService.leaveRoom.mockReturnValue({ roomId: 'room1', roomDeleted: false });
        mockRoomRepository.getRoom.mockReturnValue({ id: 'room1', players: [{ playerUid: 'u2', socketId: 'socket456' }] });
        
        controller.leaveRoom(mockSocket, { roomId: 'room1' });

        expect(mockSocket.leave).toHaveBeenCalledWith('room1');
        expect(mockRoomService.leaveRoom).toHaveBeenCalled();
        expect(mockIo.to).toHaveBeenCalledWith('socket456');
    });
    
    it('should silently return if room not found during broadcast', () => {
        mockRoomService.leaveRoom.mockReturnValue({ roomId: 'room1', roomDeleted: false });
        mockRoomRepository.getRoom.mockReturnValue(null); // room not found
        
        controller.leaveRoom(mockSocket, { roomId: 'room1' });
        expect(mockIo.to).not.toHaveBeenCalled();
    });

    it('should allow extending a room', () => {
        const mockRoom = { id: 'room1', players: [] };
        mockRoomService.extendRoom.mockReturnValue(mockRoom);
        mockRoomRepository.getRoom.mockReturnValue(mockRoom);
        const callback = jest.fn();

        controller.extendRoom(mockSocket, { roomId: 'room1' }, callback);

        expect(callback).toHaveBeenCalledWith({ ok: true });
    });

    it('should get public rooms', () => {
        const mockRooms = [{ id: 'r1' }];
        mockRoomRepository.getPublicRooms.mockReturnValue(mockRooms);
        const callback = jest.fn();

        controller.getPublicRooms(mockSocket, callback);
        expect(callback).toHaveBeenCalledWith({ ok: true, rooms: mockRooms });
    });

    it('should handle errors in getPublicRooms', () => {
        mockRoomRepository.getPublicRooms.mockImplementation(() => { throw new Error('Error fetching rooms'); });
        const callback = jest.fn();

        controller.getPublicRooms(mockSocket, callback);
        expect(callback).toHaveBeenCalledWith({ ok: false, error: 'Error fetching rooms' });
    });

    it('should handle errors in joinRoom', () => {
        mockRoomService.joinRoom.mockImplementation(() => { throw new Error('Join error'); });
        const callback = jest.fn();

        controller.joinRoom(mockSocket, { roomId: 'r1', name: 'N' }, callback);
        expect(callback).toHaveBeenCalledWith({ ok: false, error: 'Join error' });
    });
});
