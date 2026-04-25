import { Room, RoomStatus } from "../models/room/Room";
import { Player, PlayerRole } from "../models/player/Player";
import { GameState } from "../models/game/Game";

export const createRoomError = (code: string, message: string, meta: Record<string, unknown> = {}) => ({
    code,
    message,
    meta,
    isRoomError: true,
});

export const isRoomError = (err: unknown) => Boolean((err as any)?.isRoomError);

export class RoomRepository {
    private rooms = new Map<string, Room>();
    private playerToRoom = new Map<string, string>();
    private socketToPlayer = new Map<string, string>();

    constructor(
        private now = () => Date.now(),
        private roomTtlMs = 5 * 60 * 1000
    ) {}

    private generateRoomId() {
        return Math.random().toString(36).substring(2, 7).toLowerCase();
    }

    getRoom(roomId: string): Room | null {
        if (!roomId) return null;
        return this.rooms.get(roomId.toLowerCase()) || null;
    }

    getRoomForPlayer(playerUid: string): Room | null {
        const roomId = this.playerToRoom.get(playerUid);
        return roomId ? this.getRoom(roomId) : null;
    }

    getPlayerInRoom(room: Room, playerUid: string): Player | null {
        return room.players.find((p) => p.playerUid === playerUid) || null;
    }

    getPlayerBySocket(socketId: string): { room: Room, player: Player } | null {
        const playerUid = this.socketToPlayer.get(socketId);
        if (!playerUid) return null;
        const room = this.getRoomForPlayer(playerUid);
        if (!room) return null;
        const player = this.getPlayerInRoom(room, playerUid);
        return player ? { room, player } : null;
    }

    countActivePlayers(room: Room) {
        return room.players.filter((p) => p.role === "player").length;
    }

    createRoom(data: {
        hostPlayerUid: string;
        socketId: string | null;
        name: string;
        gameType: string;
        maxPlayers?: number;
        allowSpectators?: boolean;
        initialGameState: GameState;
    }): Room {
        if (!data.hostPlayerUid) {
            throw createRoomError("MISSING_PLAYER_UID", "hostPlayerUid required");
        }

        const roomId = this.generateRoomId();
        const ts = this.now();

        const room: Room = {
            id: roomId,
            gameType: data.gameType,
            status: "waiting-for-players",
            maxPlayers: data.maxPlayers ?? 2,
            allowSpectators: data.allowSpectators ?? true,
            players: [
                {
                    playerUid: data.hostPlayerUid,
                    socketId: data.socketId,
                    name: data.name,
                    role: "player",
                    status: "online",
                    score: 0,
                },
            ],
            gameState: data.initialGameState,
            createdAt: ts,
            updatedAt: ts,
            lastActivityAt: ts,
            expiresAt: ts + this.roomTtlMs,
            hasSentWarning: false,
        };

        this.rooms.set(roomId, room);
        this.playerToRoom.set(data.hostPlayerUid, roomId);
        if (data.socketId) this.socketToPlayer.set(data.socketId, data.hostPlayerUid);

        return room;
    }

    joinRoom(data: { roomId: string, playerUid: string, socketId: string | null, name: string }) {
        const room = this.getRoom(data.roomId);
        if (!room) throw createRoomError("ROOM_NOT_FOUND", "Room does not exist");

        const tsNow = this.now();
        room.updatedAt = tsNow;
        room.lastActivityAt = tsNow;
        room.expiresAt = tsNow + this.roomTtlMs;
        room.hasSentWarning = false;

        let existing = this.getPlayerInRoom(room, data.playerUid);
        if (existing) {
            existing.socketId = data.socketId;
            existing.status = "online";
            if (data.socketId) this.socketToPlayer.set(data.socketId, data.playerUid);
            return { room, role: existing.role };
        }

        const activePlayers = this.countActivePlayers(room);
        const role: PlayerRole = activePlayers < room.maxPlayers ? "player" : "spectator";

        const newPlayer: Player = {
            playerUid: data.playerUid,
            socketId: data.socketId,
            name: data.name,
            role,
            status: "online",
            score: 0,
        };

        room.players.push(newPlayer);
        this.playerToRoom.set(data.playerUid, room.id);
        if (data.socketId) this.socketToPlayer.set(data.socketId, data.playerUid);

        return { room, role };
    }

    leaveRoom(data: { roomId: string, playerUid: string }) {
        const room = this.getRoom(data.roomId);
        if (!room) return { roomId: data.roomId, roomDeleted: false };

        const player = this.getPlayerInRoom(room, data.playerUid);
        if (!player) return { roomId: data.roomId, roomDeleted: false };

        this.playerToRoom.delete(data.playerUid);
        if (player.socketId) this.socketToPlayer.delete(player.socketId);

        room.players = room.players.filter((p) => p.playerUid !== data.playerUid);
        room.updatedAt = this.now();

        if (room.players.length === 0) {
            this.rooms.delete(room.id);
            return { roomId: room.id, roomDeleted: true };
        }

        this.promoteSpectators(room);

        return { roomId: room.id, roomDeleted: false };
    }

    private promoteSpectators(room: Room) {
        let promoted = false;
        while (this.countActivePlayers(room) < room.maxPlayers) {
            const nextSpectator = room.players.find(p => p.role === "spectator");
            if (!nextSpectator) break;
            
            nextSpectator.role = "player";
            nextSpectator.score = 0;
            promoted = true;
        }

        if (this.countActivePlayers(room) < room.maxPlayers || promoted) {
            room.status = "waiting-for-players";
        }
    }

    markSocketDisconnected(socketId: string) {
        const record = this.getPlayerBySocket(socketId);
        if (!record) return null;

        const { room, player } = record;
        player.status = "offline";
        player.socketId = null;
        player.lastDisconnectedAt = this.now();

        this.socketToPlayer.delete(socketId);
        room.updatedAt = this.now();

        return { room, player };
    }

    reconnectPlayer(data: { playerUid: string, socketId: string }) {
        const room = this.getRoomForPlayer(data.playerUid);
        if (!room) return null;

        const player = this.getPlayerInRoom(room, data.playerUid);
        if (!player) return null;

        player.socketId = data.socketId;
        player.status = "online";
        player.lastDisconnectedAt = null;
        room.updatedAt = this.now();

        this.socketToPlayer.set(data.socketId, data.playerUid);

        return { room, player };
    }

    incrementScore(roomId: string, playerUid: string) {
        const room = this.getRoom(roomId);
        if (!room) return;
        const player = this.getPlayerInRoom(room, playerUid);
        if (player) {
            player.score = (player.score || 0) + 1;
            room.updatedAt = this.now();
        }
    }

    updateGameState(data: { roomId: string, gameState: GameState, status?: RoomStatus }) {
        const room = this.getRoom(data.roomId);
        if (!room) throw createRoomError("ROOM_NOT_FOUND", "No room");

        room.gameState = data.gameState;
        if (data.status) room.status = data.status;
        room.updatedAt = this.now();
        room.lastActivityAt = this.now();
        room.expiresAt = this.now() + this.roomTtlMs;
        room.hasSentWarning = false;

        return room;
    }

    serializeRoom(roomId: string) {
        const room = this.getRoom(roomId);
        if (!room) return null;

        return {
            id: room.id,
            gameType: room.gameType,
            status: room.status,
            maxPlayers: room.maxPlayers,
            allowSpectators: room.allowSpectators,
            players: room.players.map(({ socketId, ...p }) => p),
            updatedAt: room.updatedAt,
            expiresAt: room.expiresAt,
            hasSentWarning: room.hasSentWarning,
            gameState: room.gameState,
        };
    }

    extendRoom(roomId: string) {
        const room = this.getRoom(roomId);
        if (!room) return null;
        room.expiresAt = this.now() + this.roomTtlMs;
        room.hasSentWarning = false;
        room.updatedAt = this.now();
        room.lastActivityAt = this.now();
        return room;
    }

    cleanupDisconnectedPlayers(gracePeriod: number) {
        const t = this.now();
        const removed: { roomId: string, playerUid: string }[] = [];

        for (const [roomId, room] of this.rooms.entries()) {
            const initialCount = room.players.length;
            room.players = room.players.filter((p) => {
                if (p.status === "offline" && p.lastDisconnectedAt && (t - p.lastDisconnectedAt > gracePeriod)) {
                    this.playerToRoom.delete(p.playerUid);
                    removed.push({ roomId: room.id, playerUid: p.playerUid });
                    return false;
                }
                return true;
            });

            if (room.players.length !== initialCount) {
                room.updatedAt = t;
                if (room.players.length === 0) {
                    this.rooms.delete(roomId);
                } else {
                    this.promoteSpectators(room);
                }
            }
        }
        return removed;
    }

    cleanupIdleRooms(maxIdle: number) {
        const t = this.now();
        for (const [roomId, room] of this.rooms.entries()) {
            if (t - room.lastActivityAt > maxIdle) {
                this.rooms.delete(roomId);
                room.players.forEach((p) => {
                    this.playerToRoom.delete(p.playerUid);
                    if (p.socketId) this.socketToPlayer.delete(p.socketId);
                });
            }
        }
    }

    checkRoomTTLs(warningMs: number = 60 * 1000) {
        const t = this.now();
        const expired: string[] = [];
        const warnings: { roomId: string, secondsLeft: number }[] = [];

        for (const [roomId, room] of this.rooms.entries()) {
            if (room.expiresAt && t > room.expiresAt) {
                this.rooms.delete(roomId);
                room.players.forEach((p) => {
                    this.playerToRoom.delete(p.playerUid);
                    if (p.socketId) this.socketToPlayer.delete(p.socketId);
                });
                expired.push(room.id);
            } else if (room.expiresAt && !room.hasSentWarning && (room.expiresAt - t) <= warningMs) {
                warnings.push({ roomId: room.id, secondsLeft: Math.ceil((room.expiresAt - t) / 1000) });
                room.hasSentWarning = true;
            }
        }
        return { expired, warnings };
    }
}
