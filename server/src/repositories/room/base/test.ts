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
});
