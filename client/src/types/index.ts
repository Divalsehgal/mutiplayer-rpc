export interface ParticipantBase {
  playerUid: string;
  name: string;
  role: string;
  status: "online" | "offline";
}

export interface Player extends ParticipantBase {
  role: "player";
  socketId?: string | null;
  score?: number;
}

export interface Spectator extends ParticipantBase {
  role: "spectator";
  watchPreferences?: {
    showScores?: boolean;
  };
}

export interface BaseGameState {
  status: string;
  readyPlayers: string[];
}

export interface RPSState extends BaseGameState {
  roundCount: number;
  playerChoices: Record<string, string>;
  lastResult?: RoundResult | null;
}

export interface TicTacToeState extends BaseGameState {
  board: (string | null)[];
  currentTurn: string | null;
  winner: string | null;
  isDraw?: boolean;
  logs: string[];
}

export interface SnakeLadderState extends BaseGameState {
  positions: Record<string, number>;
  currentTurn: string | null;
  lastRoll: number | null;
  winner: string | null;
  logs: string[];
}

export type GameState = RPSState | TicTacToeState | SnakeLadderState;

export type Participant = Player | Spectator;

export interface RoomState {
  id: string;
  gameType: "RPS" | "SNAKE_LADDER" | "TIC_TAC_TOE";
  status: string;
  maxPlayers: number;
  allowSpectators: boolean;
  players: Participant[];
  updatedAt: number;
  gameState?: GameState;
}

export interface RoundResult {
  roomId: string;
  winnerUid: string | null;
  isDraw: boolean;
  choices: Record<string, string>;
  scores: Record<string, number>;
  playerNames?: Record<string, string>;
}

export interface BaseArenaProps {
  room: RoomState;
  gameState: GameState;
  playerUid: string;
  opponent?: Participant;
  isPlayer: boolean;
  isRoundOver?: boolean;
  handleRPSMove?: (move: string) => void;
  handleSnakeLadderMove?: () => void;
  handleTicTacToeMove?: (index: number) => void;
  handleNextRound: () => void;
}

export interface JoinRoomResponse {
  ok: boolean;
  room?: RoomState | null;
  role?: string;
  error?: string;
  code?: string;
}

export type Maybe<T> = T | null | undefined;

// Type guards
export function isPlayer(p: Participant): p is Player {
  return p.role === "player";
}

export function isSpectator(p: Participant): p is Spectator {
  return p.role === "spectator";
}
