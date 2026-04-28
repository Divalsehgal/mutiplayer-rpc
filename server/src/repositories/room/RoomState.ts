import { Room } from "../../models/room/Room";

export class RoomState {
    protected rooms = new Map<string, Room>();
    protected playerToRoom = new Map<string, string>();
    protected socketToPlayer = new Map<string, string>();

    protected now = () => Date.now();
    protected roomTtlMs = 5 * 60 * 1000;
}
