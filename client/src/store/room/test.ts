import { describe, it, expect, beforeEach } from 'vitest';
import { useRoomStore } from './index';

describe('RoomStore', () => {
    beforeEach(() => {
        useRoomStore.getState().reset();
    });

    it('should initialize with default values', () => {
        const state = useRoomStore.getState();
        expect(state.room).toBeUndefined();
        expect(state.history).toEqual([]);
        expect(state.isConnected).toBe(false);
        expect(state.error).toBeNull();
        expect(state.ttlWarning).toBeNull();
    });

    it('should set room state', () => {
        const mockRoom = { id: 'room123', status: 'waiting' } as any;
        useRoomStore.getState().setRoom(mockRoom);
        expect(useRoomStore.getState().room).toEqual(mockRoom);
    });

    it('should add to history', () => {
        const result = { winnerUid: 'u1' } as any;
        useRoomStore.getState().addHistory(result);
        expect(useRoomStore.getState().history).toContain(result);
    });

    it('should set connection status', () => {
        useRoomStore.getState().setIsConnected(true);
        expect(useRoomStore.getState().isConnected).toBe(true);
    });

    it('should set error message', () => {
        useRoomStore.getState().setError('Failed to connect');
        expect(useRoomStore.getState().error).toBe('Failed to connect');
    });

    it('should set TTL warning', () => {
        useRoomStore.getState().setTtlWarning(30);
        expect(useRoomStore.getState().ttlWarning).toBe(30);
    });

    it('should reset all state except isConnected', () => {
        useRoomStore.getState().setRoom({ id: 'r1' } as any);
        useRoomStore.getState().setError('Error');
        useRoomStore.getState().setIsConnected(true);
        
        useRoomStore.getState().reset();
        
        const state = useRoomStore.getState();
        expect(state.room).toBeUndefined();
        expect(state.error).toBeNull();
        // Reset in roomStore doesn't clear isConnected based on implementation
        expect(state.isConnected).toBe(true);
    });
});
