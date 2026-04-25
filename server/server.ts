import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";

// Config
import { PORT, CORS_ORIGIN, ROOM_IDLE_MS, GRACE_PERIOD_MS } from "./src/config";

// Repositories
import { RoomRepository } from "./src/repositories/RoomRepository";

// Socket handlers
import { initSocket } from "./src/socket/index";

// Game registry
import { gameRegistry } from "./src/games/registry";

// Logger
import { logger } from "./src/utils/logger";

const app = express();

app.use(
    cors({
        origin: CORS_ORIGIN,
        methods: ["GET", "POST"],
        credentials: true,
    })
);

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: CORS_ORIGIN,
        methods: ["GET", "POST"],
        credentials: true,
    },
    // Industry standard: Detect dead connections faster (default: 20s/45s)
    pingInterval: 10000, // 10s
    pingTimeout: 20000,  // 20s
});

// In-memory room repository
const roomStore = new RoomRepository();

// Attach all socket events + game routing
initSocket({
    io,
    roomStore,
    gameRegistry,
    logger,
});

// Basic health endpoint
app.get("/", (_req, res) => {
    res.json({ ok: true, message: "🎮 Multiplayer server online" });
});

// Clean idle rooms and check TTLs every 10 seconds
setInterval(() => {
    roomStore.cleanupIdleRooms(ROOM_IDLE_MS);

    // TTL Warnings and Expired cleanup
    const { expired, warnings } = roomStore.checkRoomTTLs(60 * 1000); // 60s warning
    
    warnings.forEach(({ roomId, secondsLeft }) => {
        io.to(roomId).emit("ROOM_WARNING", { type: "EXPIRING_SOON", secondsLeft });
    });

    expired.forEach((roomId) => {
        io.to(roomId).emit("room-error", { code: "ROOM_EXPIRED", message: "Room session expired." });
        logger.info(`⏰ Room ${roomId} expired due to TTL.`);
    });
}, 10 * 1000);

setInterval(() => {
    const removals = roomStore.cleanupDisconnectedPlayers(GRACE_PERIOD_MS);
    removals.forEach(({ roomId, playerUid }: { roomId: string, playerUid: string }) => {
        logger.info(`🧹 Grace period expired for ${playerUid} in room ${roomId}. Removing.`);
        const room = roomStore.getRoom(roomId);
        if (room) {
            io.to(roomId).emit("room-update", roomStore.serializeRoom(roomId));
        }
    });
}, 5000); // Check every 5s

server.listen(PORT, () => {
    logger.info(`🚀 Server running at http://localhost:${PORT}`);
});
