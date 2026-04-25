import { RoomRepository } from "../repositories/RoomRepository";
import { GameRegistry, Logger, SerializedRoom } from "../models";
import { GameState } from "../models/game/Game";

export class GameService {
    constructor(
        private roomRepository: RoomRepository,
        private gameRegistry: Record<string, GameRegistry>,
        private logger: Logger
    ) {}

    handleReady(roomId: string, playerUid: string) {
        const room = this.roomRepository.getRoom(roomId);
        if (!room) return null;

        const handler = this.gameRegistry[room.gameType];
        if (!handler || !handler.handleReady) return null;

        const { newGameState } = handler.handleReady({ room, gameState: room.gameState, playerUid });
        if (!newGameState) return null;

        this.roomRepository.updateGameState({
            roomId: room.id,
            gameState: newGameState,
            status: "playing"
        });
        
        return { gameState: newGameState, status: "playing" };
    }

    handleMove(roomId: string, playerUid: string, move: unknown): { gameState: GameState } | null {
        const room = this.roomRepository.getRoom(roomId);
        if (!room) return null;

        const handler = this.gameRegistry[room.gameType];
        if (!handler) return null;

        const { newGameState, error, winnerUid } = handler.handleMove({ 
            room, 
            gameState: room.gameState, 
            playerUid, 
            move, 
            io: null as any 
        });

        if (error) {
            this.logger.error(`Game move error: ${error}`);
            return null;
        }

        if (!newGameState) return null;

        this.roomRepository.updateGameState({
            roomId: room.id,
            gameState: newGameState,
        });

        // Use the explicit winnerUid from the game engine if provided
        if (winnerUid) {
            this.roomRepository.incrementScore(room.id, winnerUid);
        }

        return { gameState: newGameState };
    }

    getPublicRoomState(roomId: string, playerUid: string): SerializedRoom | null {
        const room = this.roomRepository.getRoom(roomId);
        if (!room) return null;

        const serialized = this.roomRepository.serializeRoom(roomId);
        if (!serialized) return null;

        const handler = this.gameRegistry[room.gameType];
        if (handler && handler.projectPublicState) {
            serialized.gameState = handler.projectPublicState({ 
                gameState: room.gameState, 
                playerUid 
            });
        }
        
        return serialized;
    }
}
