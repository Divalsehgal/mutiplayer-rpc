// server/src/socket/gameHandlers.js

function attachGameHandlers({ io, socket, roomStore, gameRegistry, logger }) {
    // ---------------------------------------------------------------------------
    // GAME MOVE
    // ---------------------------------------------------------------------------
    socket.on("game-move", ({ roomId, move } = {}, cb) => {
        try {
            const playerUid = socket.data.playerUid;
            if (!playerUid) throw { code: "NOT_REGISTERED", message: "Not registered" };

            const room = roomStore.getRoom(roomId);
            if (!room) throw { code: "ROOM_NOT_FOUND", message: "Room not found" };

            const gameHandler = gameRegistry[room.gameType];
            if (!gameHandler) {
                throw { code: "GAME_HANDLER_NOT_FOUND", message: "Missing game handler" };
            }

            const gameState = room.gameState || {};

            // Delegate logic to specific game handler
            const result = gameHandler.handleMove({
                room,
                gameState,
                playerUid,
                move,
                io,
            });

            if (result?.error) throw result.error;

            // Store updated game state
            roomStore.updateGameState({
                roomId: room.id,
                gameState: result.newGameState,
            });

            // Emit events (round result, move applied, snake-ladder jump, etc.)
            if (Array.isArray(result.events)) {
                for (const evt of result.events) {
                    io.to(room.id).emit(evt.type, evt.payload);
                }
            }

            cb?.({ ok: true });
        } catch (err) {
            logger.error("game-move error", err);
            cb?.({ ok: false, error: err.message || "Game move failed" });
        }
    });

    // ---------------------------------------------------------------------------
    // GAME SYNC
    // Allows reconnecting players to fetch current game state
    // ---------------------------------------------------------------------------
    socket.on("game-sync", ({ roomId } = {}, cb) => {
        try {
            const playerUid = socket.data.playerUid;

            const room = roomStore.getRoom(roomId);
            if (!room) throw { code: "ROOM_NOT_FOUND", message: "Room not found" };

            const handler = gameRegistry[room.gameType];
            if (!handler) throw { code: "GAME_HANDLER_NOT_FOUND" };

            const publicState = handler.projectPublicState({
                gameState: room.gameState,
                playerUid,
            });

            cb?.({ ok: true, state: publicState });
        } catch (err) {
            logger.error("game-sync error", err);
            cb?.({ ok: false, error: err.message || "SYNC_FAILED" });
        }
    });
}

module.exports = { attachGameHandlers };
