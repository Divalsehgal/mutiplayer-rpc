// src/socket/index.js
const { attachRoomHandlers } = require("./roomHandlers");
const { attachGameHandlers } = require("./gameHandlers");

function initSocket({ io, roomStore, gameRegistry, logger }) {
    io.on("connection", (socket) => {
        logger.info("🔌 Client connected:", socket.id);

        // Attach room + game handlers
        attachRoomHandlers({ io, socket, roomStore, gameRegistry, logger });
        attachGameHandlers({ io, socket, roomStore, gameRegistry, logger });
    });
}

module.exports = { initSocket };
