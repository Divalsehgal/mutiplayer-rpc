// server/server.js
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

// Config
const { PORT, CORS_ORIGIN, ROOM_IDLE_MS } = require("./src/config");

// Core
const { createRoomStore } = require("./src/socket/roomStore");

// Socket handlers
const { initSocket } = require("./src/socket");

// Game registry (maps gameType → handler)
const { gameRegistry } = require("./src/core/games/registry");

// Logger
const logger = require("./src/utils/logger");

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
});

// In-memory room store
const roomStore = createRoomStore();

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

// Clean idle rooms periodically
setInterval(() => {
    roomStore.cleanupIdleRooms(ROOM_IDLE_MS);
}, 60 * 1000);

server.listen(PORT, () => {
    logger.info(`🚀 Server running at http://localhost:${PORT}`);
});
