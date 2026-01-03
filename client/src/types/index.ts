export interface ParticipantBase {
  playerUid: string;
  name: string;
  // role is the discriminant used for narrowing
  role: string;
}

export interface Player extends ParticipantBase {
  role: "player";
  state: "connected" | "disconnected";
  socketId?: string | null;
  // player-specific fields
  score?: number;
}

export interface Spectator extends ParticipantBase {
  role: "spectator";
  state: "connected" | "disconnected";
  // spectator-specific fields (example)
  watchPreferences?: {
    showScores?: boolean;
  };
}

export type Participant = Player | Spectator;

export interface RoomState {
  id: string;
  gameType: string;
  status: string;
  maxPlayers: number;
  allowSpectators: boolean;
  players: Participant[];
  updatedAt: number;
  gameState?: any;
}

export interface RoundResult {
  roomId: string;
  winnerUid: string | null;
  isDraw: boolean;
  choices: Record<string, string>;
  scores: Record<string, number>;
}

export interface JoinRoomResponse {
  ok: boolean;
  room?: RoomState | null;
  role?: string;
  error?: string;
  code?: string;
}

export type Maybe<T> = T | null | undefined;

export default {} as const;

// Type guards
export function isPlayer(p: Participant): p is Player {
  return p.role === "player";
}

export function isSpectator(p: Participant): p is Spectator {
  return p.role === "spectator";
}
