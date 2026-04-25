import { RoomRepository } from "../repositories/RoomRepository";
import { GameRegistry, Logger, Room } from "../models";
import { GameState } from "../models/game/Game";

const DEFAULT_MAX_PLAYERS = 2;
const SNAKE_LADDER_MAX_PLAYERS = 4;

export class RoomService {
    constructor(
        private roomRepository: RoomRepository,
        private gameRegistry: Record<string, GameRegistry>,
        private logger: Logger
    ) {}

    createRoom(data: { playerUid: string, socketId: string, name: string, gameType: string }): Room {
        const handler = this.gameRegistry[data.gameType];
        if (!handler) throw new Error("Unsupported game type");
        
        let maxPlayers = DEFAULT_MAX_PLAYERS;
        if (data.gameType === 'SNAKE_LADDER') {
            maxPlayers = SNAKE_LADDER_MAX_PLAYERS;
        }

        const initialGameState = handler.getInitialState?.();
        if (!initialGameState) throw new Error("Could not initialize game state");

        const room = this.roomRepository.createRoom({
            hostPlayerUid: data.playerUid,
            socketId: data.socketId,
            name: data.name,
            gameType: data.gameType,
            initialGameState,
            maxPlayers
        });
        this.logger.info(`🏠 Room Created: ${room.id} by ${data.playerUid} (Max: ${maxPlayers})`);
        return room;
    }

    joinRoom(data: { roomId: string, playerUid: string, socketId: string, name: string }): { room: Room, role: string } {
        const result = this.roomRepository.joinRoom(data);
        this.logger.info(`👤 Player ${data.playerUid} joined Room ${data.roomId} as ${result.role}`);
        return result;
    }

    handleReady(roomId: string, playerUid: string): { gameState: GameState, status: string } | null {
        const room = this.roomRepository.getRoom(roomId);
        if (!room) return null;

        const handler = this.gameRegistry[room.gameType];
        if (!handler || !handler.handleReady) return null;

        const { newGameState } = handler.handleReady({ room, gameState: room.gameState, playerUid });
        this.roomRepository.updateGameState({
            roomId: room.id,
            gameState: newGameState,
            status: "playing"
        });
        
        return { gameState: newGameState, status: "playing" };
    }

    resetRoomState(roomId: string): void {
        const room = this.roomRepository.getRoom(roomId);
        if (!room) return;

        // Reset all scores when match is aborted/interrupted
        room.players.forEach(p => p.score = 0);
        
        // Reset to initial game state
        const handler = this.gameRegistry[room.gameType];
        if (handler && handler.getInitialState) {
            room.gameState = handler.getInitialState();
        }
        
        this.logger.info(`🔄 Room ${roomId} reset to initial state`);
    }

    leaveRoom(data: { roomId: string, playerUid: string }): { roomId: string, roomDeleted: boolean } {
        const result = this.roomRepository.leaveRoom(data);
        
        if (!result.roomDeleted) {
            const room = this.roomRepository.getRoom(data.roomId);
            if (room && room.status === "waiting-for-players") {
                this.resetRoomState(data.roomId);
            }
            this.logger.info(`👤 Player ${data.playerUid} left Room ${data.roomId}`);
        } else {
            this.logger.info(`🗑️ Room ${data.roomId} deleted (last player left)`);
        }
        
        return result;
    }

    extendRoom(roomId: string): Room | null {
        return this.roomRepository.extendRoom(roomId);
    }
}
