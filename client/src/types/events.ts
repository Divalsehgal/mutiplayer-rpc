import type { RoomState, RoundResult, JoinRoomResponse } from "@/types";

// Events sent from SERVER -> CLIENT
export interface ServerToClientEvents {
  "room-update": (updated: RoomState | null) => void;
  "round-result": (result: RoundResult) => void;
  "room-closed": (data: { roomId: string }) => void;
  "player-state-update": (data: { roomId: string; playerUid: string; status: string }) => void;
  "ROOM_WARNING": (data: { secondsLeft: number }) => void;
}

// Events sent from CLIENT -> SERVER
export interface ClientToServerEvents {
  register: (data: { playerUid: string; name: string }, cb?: (res: { ok: boolean; [k: string]: unknown }) => void) => void;
  "create-room": (data: {
    hostName?: string;
    gameType?: string;
    maxPlayers?: number;
    allowSpectators?: boolean;
  }, cb?: (res: JoinRoomResponse & { roomId?: string }) => void) => void;
  "join-room": (data: { roomId: string; playerUid?: string; name?: string }, cb?: (res: JoinRoomResponse) => void) => void;
  "request-player-slot": (data: { roomId: string; playerUid?: string }, cb?: (res: { ok: boolean; [k: string]: unknown }) => void) => void;
  "game-move": (data: { roomId: string; move: string }) => void;
  "game-ready": (data: { roomId: string }) => void;
  "leave-room": (data: { roomId: string }, cb?: (res: { ok: boolean; roomDeleted?: boolean }) => void) => void;
  "extend-room": (data: { roomId: string }, cb?: (res: { ok: boolean }) => void) => void;
}

export default {} as const;
