import { sendError } from './sendError';

describe('sendError', () => {
    it('should call callback with error payload if provided', () => {
        const cb = jest.fn();
        const err = { isRoomError: true, code: 'ROOM_NOT_FOUND', message: 'Room not found' };
        sendError(cb, null, err, 'DEFAULT_CODE');
        expect(cb).toHaveBeenCalledWith({ ok: false, code: 'ROOM_NOT_FOUND', error: 'Room not found' });
    });

    it('should call callback with default error if not a RoomError', () => {
        const cb = jest.fn();
        const err = new Error('Random error');
        sendError(cb, null, err, 'DEFAULT_CODE');
        expect(cb).toHaveBeenCalledWith({ ok: false, code: 'DEFAULT_CODE', error: 'Internal server error' });
    });

    it('should emit error to socket if no callback is provided', () => {
        const socket = { emit: jest.fn() } as any;
        const err = { isRoomError: true, code: 'ROOM_NOT_FOUND', message: 'Room not found' };
        sendError(undefined, 'error-event', err, 'DEFAULT_CODE', socket);
        expect(socket.emit).toHaveBeenCalledWith('error-event', { code: 'ROOM_NOT_FOUND', error: 'Room not found' });
    });
});
