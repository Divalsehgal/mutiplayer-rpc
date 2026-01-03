// src/socket/game/snakeGameHandler.js

module.exports = {
    handleMove({ room, gameState, playerUid, move, io }) {
        // Example: move = { dice: 4 }
        if (!move || typeof move.dice !== "number") {
            return { error: { code: "INVALID_MOVE", message: "Missing dice roll" } };
        }

        const newPositions = { ...gameState.positions };
        const snakes = gameState.snakes || {};
        const ladders = gameState.ladders || {};

        let pos = newPositions[playerUid] || 0;
        pos += move.dice;

        if (snakes[pos]) pos = snakes[pos];
        if (ladders[pos]) pos = ladders[pos];

        newPositions[playerUid] = pos;

        const finalState = { ...gameState, positions: newPositions };

        const events = [
            {
                type: "board-update",
                payload: { roomId: room.id, positions: newPositions },
            },
        ];

        const finished = pos >= 100;
        if (finished) {
            events.push({
                type: "game-finished",
                payload: { roomId: room.id, winnerUid: playerUid },
            });
        }

        return {
            newGameState: finalState,
            events,
        };
    },

    projectPublicState({ gameState }) {
        return {
            positions: gameState.positions,
        };
    },
};
