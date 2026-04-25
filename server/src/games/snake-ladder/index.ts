import { Room, SnakeLadderState, GameState } from "../../models";
import { SNAKE_LADDER_BOARD } from "./constants";

export const snakeLadderGameHandler = {
  getInitialState(): SnakeLadderState {
    return {
      status: "waiting-for-players",
      positions: {}, // uid -> pos
      currentTurn: null,
      lastRoll: null,
      winner: null,
      readyPlayers: [],
      logs: ["Game initialized. Waiting for players..."]
    };
  },

  handleReady({ room, gameState, playerUid }: { room: Room; gameState: GameState; playerUid: string }) {
    const state = gameState as SnakeLadderState;
    const players = room.players.filter((p) => p.role === "player");
    
    // Critical: Require at least 2 players to start
    if (players.length < 2) {
      return { newGameState: gameState };
    }

    let { readyPlayers = [], status: currentStatus } = gameState;

    // Initial start from lobby: Host override
    if (currentStatus === 'waiting-for-players') {
        const positions: Record<string, number> = {};
        players.forEach((p) => (positions[p.playerUid] = 1));

        return {
            newGameState: {
              ...gameState,
              status: "playing",
              positions,
              currentTurn: players[0].playerUid,
              winner: null,
              lastRoll: null,
              readyPlayers: [],
              logs: ["Match started! Tactical calibration complete."]
            }
        };
    }

    if (!readyPlayers.includes(playerUid)) {
        readyPlayers.push(playerUid);
    }

    // Logic for re-start (rematch)
    if (readyPlayers.length >= players.length) {
        const positions: Record<string, number> = {};
        players.forEach((p) => (positions[p.playerUid] = 1));

        return {
            newGameState: {
              ...gameState,
              status: "playing",
              positions,
              currentTurn: players[0].playerUid,
              winner: null,
              lastRoll: null,
              readyPlayers: [],
              logs: ["Rematch initiated. New round start."]
            }
        };
    }

    return {
      newGameState: {
        ...state,
        readyPlayers
      }
    };
  },

  handleMove({ room, gameState, playerUid }: { room: Room; gameState: GameState; playerUid: string }) {
    const state = gameState as SnakeLadderState;
    // Critical: Stop game if any player leaves
    const players = room.players.filter((p) => p.role === "player");
    if (players.length < 2) {
      return {
        newGameState: {
          ...gameState,
          status: "waiting-for-players",
          logs: ["Match interrupted: Opponent abandoned. Returning to lobby..."]
        }
      };
    }

    if (state.winner || state.currentTurn !== playerUid) {
      return { newGameState: state };
    }

    const roll = Math.floor(Math.random() * 6) + 1;
    let newPos = (state.positions[playerUid] || 1) + roll;
    let log = `${room.players.find((p) => p.playerUid === playerUid)?.name} rolled a ${roll}.`;

    if (newPos > 100) {
      newPos = state.positions[playerUid];
      log += ` (Need exact roll to finish)`;
    } else {
      if (SNAKE_LADDER_BOARD.snakes[newPos]) {
        newPos = SNAKE_LADDER_BOARD.snakes[newPos];
        log += ` Ouch! A snake 🐍. Down to ${newPos}.`;
      } else if (SNAKE_LADDER_BOARD.ladders[newPos]) {
        newPos = SNAKE_LADDER_BOARD.ladders[newPos];
        log += ` Yahoo! A ladder 🪜. Up to ${newPos}.`;
      }
    }

    const newPositions = { ...state.positions, [playerUid]: newPos };
    const currentIndex = players.findIndex((p) => p.playerUid === playerUid);
    const nextPlayer = players[(currentIndex + 1) % players.length].playerUid;

    let winner = null;
    let newStatus = state.status;
    if (newPos === 100) {
      winner = playerUid;
      newStatus = "finished";
      log += ` WE HAVE A CHAMPION! 🎉`;
    }

    return {
      newGameState: {
        ...state,
        status: newStatus,
        positions: newPositions,
        currentTurn: winner ? null : nextPlayer,
        lastRoll: roll,
        winner,
        logs: [log, ...state.logs].slice(0, 10)
      } as SnakeLadderState,
      winnerUid: winner
    };
  },

  projectPublicState({ gameState }: { gameState: GameState }): GameState {
    return gameState;
  }
};
