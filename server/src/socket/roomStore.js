// Small error helper (not class-based)
const createRoomError = (code, message, meta = {}) => ({
    code,
    message,
    meta,
    isRoomError: true,
});

const isRoomError = (err) => Boolean(err?.isRoomError);

function createRoomStore(now = () => Date.now()) {
    const rooms = new Map();          // roomId -> room object
    const playerToRoom = new Map();   // playerUid -> roomId
    const socketToPlayer = new Map(); // socketId -> playerUid

    const generateRoomId = () =>
        Math.random().toString(36).substring(2, 7);

    const getRoom = (roomId) => rooms.get(roomId) || null;

    const getRoomForPlayer = (playerUid) => {
        const roomId = playerToRoom.get(playerUid);
        return roomId ? getRoom(roomId) : null;
    };

    const getPlayerInRoom = (room, playerUid) =>
        room.players.find((p) => p.playerUid === playerUid) || null;

    const getPlayerBySocket = (socketId) => {
        const playerUid = socketToPlayer.get(socketId);
        if (!playerUid) return null;
        const room = getRoomForPlayer(playerUid);
        if (!room) return null;
        const player = getPlayerInRoom(room, playerUid);
        return player ? { room, player } : null;
    };

    const countActivePlayers = (room) =>
        room.players.filter((p) => p.role === "player").length;

    // -----------------------------
    // Create Room
    // -----------------------------
    const createRoom = ({
        hostPlayerUid,
        socketId,
        name,
        gameType,
        maxPlayers = 2,
        allowSpectators = true,
        initialGameState = null,
    }) => {
        if (!hostPlayerUid) {
            throw createRoomError("MISSING_PLAYER_UID", "hostPlayerUid required");
        }

        const roomId = generateRoomId();
        const ts = now();

        const room = {
            id: roomId,
            gameType,
            status: "waiting-for-players",
            maxPlayers,
            allowSpectators,
            players: [
                {
                    playerUid: hostPlayerUid,
                    socketId,
                    name,
                    role: "player",
                    state: "connected",
                },
            ],
            gameState: initialGameState,
            createdAt: ts,
            updatedAt: ts,
        };

        rooms.set(roomId, room);
        playerToRoom.set(hostPlayerUid, roomId);
        socketToPlayer.set(socketId, hostPlayerUid);

        return room;
    };

    // -----------------------------
    // Join Room
    // -----------------------------
    const joinRoom = ({ roomId, playerUid, socketId, name }) => {
        const room = getRoom(roomId);
        if (!room) throw createRoomError("ROOM_NOT_FOUND", "Room does not exist");

        // Rejoin?
        let existing = getPlayerInRoom(room, playerUid);
        if (existing) {
            existing.socketId = socketId;
            existing.state = "connected";
            socketToPlayer.set(socketId, playerUid);
            room.updatedAt = now();
            return { room, role: existing.role };
        }

        const activePlayers = countActivePlayers(room);
        const role = activePlayers < room.maxPlayers ? "player" : "spectator";

        const newPlayer = {
            playerUid,
            socketId,
            name,
            role,
            state: "connected",
        };

        room.players.push(newPlayer);
        room.updatedAt = now();
        playerToRoom.set(playerUid, room.id);

        if (socketId) socketToPlayer.set(socketId, playerUid);

        const newActive = countActivePlayers(room);
        room.status = newActive === room.maxPlayers ? "playing" : "waiting-for-players";

        return { room, role };
    };

    // -----------------------------
    // Request Player Slot
    // -----------------------------
    const requestPlayerSlot = ({ roomId, playerUid }) => {
        const room = getRoom(roomId);
        if (!room) throw createRoomError("ROOM_NOT_FOUND", "Room not found");

        const activePlayers = countActivePlayers(room);
        if (activePlayers >= room.maxPlayers) {
            throw createRoomError("NO_PLAYER_SLOT", "Player slot is full");
        }

        const player = getPlayerInRoom(room, playerUid);
        if (!player) throw createRoomError("NOT_IN_ROOM", "User not in room");

        player.role = "player";
        room.updatedAt = now();

        if (countActivePlayers(room) === room.maxPlayers) {
            room.status = "playing";
        }

        return { room, role: "player" };
    };

    // -----------------------------
    // Leave Room
    // -----------------------------
    const leaveRoom = ({ roomId, playerUid }) => {
        const room = getRoom(roomId);
        if (!room) return { roomDeleted: false };

        const player = getPlayerInRoom(room, playerUid);
        if (!player) return { roomDeleted: false };

        playerToRoom.delete(playerUid);
        if (player.socketId) socketToPlayer.delete(player.socketId);

        room.players = room.players.filter((p) => p.playerUid !== playerUid);
        room.updatedAt = now();

        if (room.players.length === 0) {
            rooms.delete(room.id);
            return { roomId: room.id, roomDeleted: true };
        }

        if (countActivePlayers(room) === 0) {
            room.status = "waiting-for-players";
        }

        return { roomId: room.id, roomDeleted: false };
    };

    // -----------------------------
    // Disconnect
    // -----------------------------
    const markSocketDisconnected = (socketId) => {
        const record = getPlayerBySocket(socketId);
        if (!record) return null;

        const { room, player } = record;
        player.state = "disconnected";
        player.socketId = null;

        socketToPlayer.delete(socketId);
        room.updatedAt = now();

        return { room, player };
    };

    const reconnectPlayer = ({ playerUid, socketId }) => {
        const room = getRoomForPlayer(playerUid);
        if (!room) return null;

        const player = getPlayerInRoom(room, playerUid);
        if (!player) return null;

        player.socketId = socketId;
        player.state = "connected";
        room.updatedAt = now();

        socketToPlayer.set(socketId, playerUid);

        return { room, player };
    };

    // -----------------------------
    // Update Game State
    // -----------------------------
    const updateGameState = ({ roomId, gameState, status }) => {
        const room = getRoom(roomId);
        if (!room) throw createRoomError("ROOM_NOT_FOUND", "No room");

        room.gameState = gameState;
        if (status) room.status = status;
        room.updatedAt = now();

        return room;
    };

    // -----------------------------
    // Serialize Room
    // -----------------------------
    const serializeRoom = (roomId) => {
        const room = getRoom(roomId);
        if (!room) return null;

        return {
            id: room.id,
            gameType: room.gameType,
            status: room.status,
            maxPlayers: room.maxPlayers,
            allowSpectators: room.allowSpectators,
            players: room.players.map((p) => ({
                playerUid: p.playerUid,
                name: p.name,
                role: p.role,
                state: p.state,
            })),
            updatedAt: room.updatedAt,
            gameState: room.gameState,             // ← ADD THIS!
        };
    };


    // -----------------------------
    // Cleanup
    // -----------------------------
    const cleanupIdleRooms = (maxIdle) => {
        const t = now();
        for (const [roomId, room] of rooms.entries()) {
            if (t - room.updatedAt > maxIdle) {
                rooms.delete(roomId);
                room.players.forEach((p) => {
                    playerToRoom.delete(p.playerUid);
                    if (p.socketId) socketToPlayer.delete(p.socketId);
                });
            }
        }
    };

    return {
        getRoom,
        getRoomForPlayer,

        createRoom,
        joinRoom,
        requestPlayerSlot,
        leaveRoom,

        reconnectPlayer,
        markSocketDisconnected,

        updateGameState,
        serializeRoom,
        cleanupIdleRooms,

        createRoomError,
        isRoomError,
    };
}

module.exports = { createRoomStore };
