import { registerRoomRoutes } from './index';
import { RoomController } from '../../controllers/room';
import { Server } from 'socket.io';

describe('RoomRoutes', () => {
    let mockIo: jest.Mocked<Server>;
    let mockSocket: any;
    let mockController: jest.Mocked<RoomController>;

    beforeEach(() => {
        mockIo = {} as any;
        mockSocket = {
            on: jest.fn(),
            id: 'socket-id'
        };
        mockController = {
            createRoom: jest.fn(),
            joinRoom: jest.fn(),
            leaveRoom: jest.fn(),
            extendRoom: jest.fn(),
            getPublicRooms: jest.fn(),
        } as any;
    });

    it('should register all room events', () => {
        registerRoomRoutes(mockIo, mockSocket, mockController);

        expect(mockSocket.on).toHaveBeenCalledWith('create-room', expect.any(Function));
        expect(mockSocket.on).toHaveBeenCalledWith('join-room', expect.any(Function));
        expect(mockSocket.on).toHaveBeenCalledWith('leave-room', expect.any(Function));
        expect(mockSocket.on).toHaveBeenCalledWith('extend-room', expect.any(Function));
        expect(mockSocket.on).toHaveBeenCalledWith('get-public-rooms', expect.any(Function));
    });

    it('should call controller methods when events are triggered', () => {
        registerRoomRoutes(mockIo, mockSocket, mockController);

        // Get the callbacks passed to socket.on
        const eventHandlers: Record<string, Function> = {};
        (mockSocket.on as jest.Mock).mock.calls.forEach(([event, handler]) => {
            eventHandlers[event] = handler;
        });

        const callback = jest.fn();
        const data = { roomId: '123' };

        eventHandlers['create-room'](data, callback);
        expect(mockController.createRoom).toHaveBeenCalledWith(mockSocket, data, callback);

        eventHandlers['join-room'](data, callback);
        expect(mockController.joinRoom).toHaveBeenCalledWith(mockSocket, data, callback);

        eventHandlers['leave-room'](data);
        expect(mockController.leaveRoom).toHaveBeenCalledWith(mockSocket, data);

        eventHandlers['extend-room'](data, callback);
        expect(mockController.extendRoom).toHaveBeenCalledWith(mockSocket, data, callback);

        eventHandlers['get-public-rooms'](callback);
        expect(mockController.getPublicRooms).toHaveBeenCalledWith(mockSocket, callback);
    });
});
