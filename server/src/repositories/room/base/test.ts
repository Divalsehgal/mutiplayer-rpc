import { RoomBaseRepository } from './index';

describe('RoomBaseRepository', () => {
    let repo: RoomBaseRepository;

    beforeEach(() => {
        repo = new RoomBaseRepository();
    });

    it('should generate a room id', () => {
        const id = (repo as any).generateRoomId();
        expect(id).toHaveLength(5);
    });

    it('should return null for non-existent room', () => {
        expect(repo.getRoom('none')).toBeNull();
    });

    it('should get public rooms', () => {
        const room1: any = { id: 'r1', isPublic: true, players: [] };
        const room2: any = { id: 'r2', isPublic: false, players: [] };
        (repo as any).rooms.set('r1', room1);
        (repo as any).rooms.set('r2', room2);
        
        const publicRooms = repo.getPublicRooms();
        expect(publicRooms).toHaveLength(1);
        expect(publicRooms[0].id).toBe('r1');
    });

    it('should return null for empty roomId', () => {
        expect(repo.getRoom('')).toBeNull();
    });
});
