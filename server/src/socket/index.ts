import { Socket, Server } from "socket.io";
import { RoomRepository } from "../repositories/RoomRepository";
import { GameRegistry } from "../models";
import { RoomService } from "../services/RoomService";
import { GameService } from "../services/GameService";
import { RoomController } from "../controllers/RoomController";
import { GameController } from "../controllers/GameController";
import { registerRoomRoutes } from "../routes/room.routes";
import { registerGameRoutes } from "../routes/game.routes";
import { Logger } from "../models";

export function initSocket({ io, roomStore, gameRegistry, logger }: {
    io: Server,
    roomStore: RoomRepository,
    gameRegistry: Record<string, GameRegistry>,
    logger: Logger
}) {
    const roomService = new RoomService(roomStore, gameRegistry, logger);
    const gameService = new GameService(roomStore, gameRegistry, logger);

    const roomController = new RoomController(io, roomService, gameService, roomStore);
    const gameController = new GameController(io, gameService, roomStore);

    // Authentication middleware
    io.use((socket, next) => {
        const { playerUid } = socket.handshake.auth;
        if (!playerUid) return next(new Error("AUTHENTICATION_FAILED: playerUid required"));
        socket.data.playerUid = playerUid;
        next();
    });

    io.on("connection", (socket: Socket) => {
        logger.info(`🔌 Client connected: ${socket.id} (UID: ${socket.data.playerUid})`);

        // Register Routes
        registerRoomRoutes(io, socket, roomController);
        registerGameRoutes(io, socket, gameController);

        socket.on("register", (_data, callback) => callback?.({ ok: true }));

        socket.on("disconnect", () => {
            const result = roomStore.markSocketDisconnected(socket.id);
            if (result) {
                io.to(result.room.id).emit("room-update", roomStore.serializeRoom(result.room.id));
            }
        });
    });
}
