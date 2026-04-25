import { Socket, Server } from "socket.io";
import { GameService } from "../services/GameService";
import { RoomRepository } from "../repositories/RoomRepository";
import { GameReadyRequest, GameMoveRequest } from "../dtos/game.dto";

export class GameController {
    constructor(
        private io: Server,
        private gameService: GameService,
        private roomRepository: RoomRepository
    ) {}

    private broadcastRoomUpdate(roomId: string) {
        const room = this.roomRepository.getRoom(roomId);
        if (!room) return;

        room.players.forEach(p => {
            if (p.socketId) {
                const personalizedState = this.gameService.getPublicRoomState(roomId, p.playerUid);
                this.io.to(p.socketId).emit("room-update", personalizedState);
            }
        });
    }

    handleReady(socket: Socket, data: GameReadyRequest) {
        const playerUid = socket.data.playerUid;
        const result = this.gameService.handleReady(data.roomId, playerUid);
        if (result) {
            this.broadcastRoomUpdate(data.roomId);
        }
    }

    handleMove(socket: Socket, data: GameMoveRequest) {
        const playerUid = socket.data.playerUid;
        const result = this.gameService.handleMove(data.roomId, playerUid, data.move);
        if (result) {
            this.broadcastRoomUpdate(data.roomId);
        }
    }
}
