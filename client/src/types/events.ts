import type { RoomState, RoundResult, JoinRoomResponse } from "@/types";

// Events sent from SERVER -> CLIENT
export interface ServerToClientEvents {
  "room-update": RoomState | null;
  "round-result": RoundResult;
  "room-closed": { roomId: string };
  "player-state-update": { roomId: string; playerUid: string; state: string };
}

// Events sent from CLIENT -> SERVER
export interface ClientToServerEvents {
  register: { playerUid: string; name: string } & {
    cb?: (res: { ok: boolean; [k: string]: any }) => void;
  };
  "create-room": {
    gameType?: string;
    maxPlayers?: number;
    allowSpectators?: boolean;
  } & { cb?: (res: JoinRoomResponse & { roomId?: string }) => void };
  "join-room": { roomId: string; playerUid?: string; name?: string } & {
    cb?: (res: JoinRoomResponse) => void;
  };
  "request-player-slot": { roomId: string; playerUid?: string } & {
    cb?: (res: { ok: boolean; [k: string]: any }) => void;
  };
  "game-move": { roomId: string; move: string };
  "leave-room": {} & {
    cb?: (res: { ok: boolean; roomDeleted?: boolean }) => void;
  };
}

export default {} as const;
