import { Socket, Server } from "socket.io";
import jwt from "jsonwebtoken";
import { RoomRepository } from "../repositories/room";
import { GameRegistry } from "../models";
import { RoomService } from "../services/room";
import { GameService } from "../services/game";
import { RoomController } from "../controllers/room";
import { GameController } from "../controllers/game";
import { registerRoomRoutes } from "../routes/room";
import { registerGameRoutes } from "../routes/game";
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
        const { token, playerUid } = socket.handshake.auth;

        logger.info(`🔑 Socket Auth Attempt - UID: ${playerUid}, HasToken: ${!!token}`);

        // If JWT token is provided, verify it
        if (token) {
            try {
                const secret = process.env.JWT_SECRET || "access_secret_key";
                if (!process.env.JWT_SECRET) {
                    logger.warn("⚠️ JWT_SECRET not found in env, using default fallback for Socket!");
                }
                const decoded = jwt.verify(token, secret) as { _id: string; user_name: string, avatar?: string };
                
                socket.data.avatar = decoded.avatar;

                socket.data.user = decoded;
                socket.data.playerUid = decoded._id;

                logger.info(`✅ Socket Authenticated: ${decoded.user_name} (${decoded._id})`);
                return next();
            } catch (err) {
                const error = err as Error;
                logger.error(`❌ Socket JWT Verification Failed: ${error.message}`);
                return next(new Error(`AUTHENTICATION_FAILED: ${error.message}`));
            }
        }

        // Fallback to anonymous playerUid 
        if (!playerUid) {
            logger.error(`❌ Socket Auth Failed: No token and no playerUid`);
            return next(new Error("AUTHENTICATION_FAILED: Authentication required"));
        }

        socket.data.playerUid = playerUid;
        logger.info(`👤 Socket Connected as Anonymous: ${playerUid}`);
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
