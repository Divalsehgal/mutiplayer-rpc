// src/config/index.js
module.exports = {
    PORT: process.env.PORT || 3030,
    CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173",
    ROOM_IDLE_MS: 15 * 60 * 1000, // 15 minutes
};
