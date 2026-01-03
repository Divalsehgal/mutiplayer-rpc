// server/src/socket/roomHandlers.js

function attachRoomHandlers({ io, socket, roomStore, gameRegistry, logger }) {
    //
    // Helper to standardize errors
    //
    const sendError = (cb, fallbackEvent, err, defaultCode) => {
        const payload = err?.isRoomError
            ? { code: err.code, error: err.message }
            : { code: defaultCode, error: "Internal server error" };

        if (cb) return cb({ ok: false, ...payload });
        if (fallbackEvent) socket.emit(fallbackEvent, payload);
    };

    //
    // Emit serialized room state to all clients inside the room
    //
    const emitRoomUpdate = (roomId) => {
        const state = roomStore.serializeRoom(roomId);
        if (state) io.to(roomId).emit("room-update", state);
    };

    // ---------------------------------------------------------------------------
    // REGISTER
    // ---------------------------------------------------------------------------
    socket.on("register", ({ playerUid, name } = {}, cb) => {
        try {
            if (!playerUid) {
                throw {
                    isRoomError: true,
                    code: "MISSING_PLAYER_UID",
                    message: "playerUid is required in register()",
                };
            }

            socket.data.playerUid = playerUid;
            socket.data.name = (name || "").trim() || "Player";

            // Attempt reconnection
            const recon = roomStore.reconnectPlayer({
                playerUid,
                socketId: socket.id,
            });

            if (recon?.room) {
                socket.join(recon.room.id);
                emitRoomUpdate(recon.room.id);
                socket.emit("reconnected", { roomId: recon.room.id });
            }

            cb?.({
                ok: true,
                playerUid,
                name: socket.data.name,
            });
        } catch (err) {
            logger.error("register error:", err);
            sendError(cb, null, err, "REGISTER_ERROR");
        }
    });

    // ---------------------------------------------------------------------------
    // CREATE-ROOM
    // ---------------------------------------------------------------------------
    socket.on(
        "create-room",
        ({ gameType = "RPS", maxPlayers = 2, allowSpectators = true } = {}, cb) => {
            try {
                const playerUid = socket.data.playerUid;
                const name = socket.data.name || "Player";

                if (!playerUid) {
                    throw {
                        isRoomError: true,
                        code: "NOT_REGISTERED",
                        message: "Call register() before create-room.",
                    };
                }

                // Step 1: Create room entry
                const room = roomStore.createRoom({
                    hostPlayerUid: playerUid,
                    socketId: socket.id,
                    name,
                    gameType,
                    maxPlayers,
                    allowSpectators,
                });

                // Step 2: Initialize game state through registry
                const gameEngine = gameRegistry[gameType];
                if (gameEngine?.createInitialState) {
                    const initialGameState = gameEngine.createInitialState({ room });
                    roomStore.updateGameState({
                        roomId: room.id,
                        gameState: initialGameState,
                    });
                }

                // Step 3: Put host socket in the room
                socket.join(room.id);

                // Step 4: Notify room
                emitRoomUpdate(room.id);

                cb?.({
                    ok: true,
                    roomId: room.id,
                    room: roomStore.serializeRoom(room.id),
                });
            } catch (err) {
                logger.error("create-room error:", err);
                sendError(cb, "create-room-error", err, "CREATE_ROOM_ERROR");
            }
        }
    );

    // ---------------------------------------------------------------------------
    // JOIN-ROOM (as player or spectator)
    // ---------------------------------------------------------------------------
    socket.on("join-room", ({ roomId } = {}, cb) => {
        try {
            const playerUid = socket.data.playerUid;
            const name = socket.data.name || "Player";

            if (!playerUid) {
                throw {
                    isRoomError: true,
                    code: "NOT_REGISTERED",
                    message: "Call register() before join-room.",
                };
            }

            const { room, role } = roomStore.joinRoom({
                roomId,
                playerUid,
                socketId: socket.id,
                name,
            });

            socket.join(room.id);
            emitRoomUpdate(room.id);

            cb?.({
                ok: true,
                roomId: room.id,
                role,
                room: roomStore.serializeRoom(room.id),
            });
        } catch (err) {
            logger.error("join-room error:", err);
            sendError(cb, "join-room-error", err, "JOIN_ROOM_ERROR");
        }
    });

    // ---------------------------------------------------------------------------
    // REQUEST PLAYER SLOT (spectator → player)
    // ---------------------------------------------------------------------------
    socket.on("request-player-slot", ({ roomId } = {}, cb) => {
        try {
            const playerUid = socket.data.playerUid;
            if (!playerUid) {
                throw {
                    isRoomError: true,
                    code: "NOT_REGISTERED",
                    message: "Call register() first.",
                };
            }

            const { room, role } = roomStore.requestPlayerSlot({ roomId, playerUid });

            emitRoomUpdate(room.id);

            cb?.({
                ok: true,
                role,
                roomId: room.id,
                room: roomStore.serializeRoom(room.id),
            });
        } catch (err) {
            logger.error("request-player-slot error:", err);
            sendError(
                cb,
                "request-player-slot-error",
                err,
                "REQUEST_PLAYER_SLOT_ERROR"
            );
        }
    });

    // ---------------------------------------------------------------------------
    // LEAVE ROOM
    // ---------------------------------------------------------------------------
    socket.on("leave-room", (_, cb) => {
        try {
            const playerUid = socket.data.playerUid;
            if (!playerUid) return cb?.({ ok: true });

            const room = roomStore.getRoomForPlayer(playerUid);
            if (!room) return cb?.({ ok: true });

            const { roomId, roomDeleted } = roomStore.leaveRoom({
                roomId: room.id,
                playerUid,
            });

            socket.leave(roomId);

            if (roomDeleted) {
                io.to(roomId).emit("room-closed", { roomId });
            } else {
                emitRoomUpdate(roomId);
            }

            cb?.({ ok: true, roomDeleted });
        } catch (err) {
            logger.error("leave-room error:", err);
            sendError(cb, null, err, "LEAVE_ROOM_ERROR");
        }
    });

    // ---------------------------------------------------------------------------
    // DISCONNECT
    // ---------------------------------------------------------------------------
    socket.on("disconnect", () => {
        try {
            const result = roomStore.markSocketDisconnected(socket.id);
            if (!result) return;

            const { room, player } = result;

            emitRoomUpdate(room.id);
            io.to(room.id).emit("player-state-update", {
                roomId: room.id,
                playerUid: player.playerUid,
                state: player.state,
            });
        } catch (err) {
            logger.error("disconnect handling error:", err);
        }
    });
}

module.exports = { attachRoomHandlers };
