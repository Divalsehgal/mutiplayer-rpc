// src/socket/game/rpsGameHandler.js

module.exports = {
    handleMove({ room, gameState, playerUid, move, io }) {
        const choice = typeof move === "string" ? move.trim() : "";
        const VALID = ["Rock", "Paper", "Scissor"];

        if (!VALID.includes(choice)) {
            return {
                error: { code: "INVALID_MOVE", message: "Invalid move" },
            };
        }

        const newGameState = {
            ...gameState,
            moves: { ...gameState.moves, [playerUid]: choice },
        };

        // Collect players
        const players = room.players.filter((p) => p.role === "player");
        if (players.length !== 2) {
            return { newGameState, events: [] };
        }

        const [p1, p2] = players.map((p) => p.playerUid);

        const m1 = newGameState.moves[p1];
        const m2 = newGameState.moves[p2];

        if (!m1 || !m2) {
            return { newGameState, events: [] };
        }

        const beats = {
            Rock: "Scissor",
            Scissor: "Paper",
            Paper: "Rock",
        };

        let winnerUid = null;
        let isDraw = false;

        if (m1 === m2) {
            isDraw = true;
        } else if (beats[m1] === m2) {
            winnerUid = p1;
        } else {
            winnerUid = p2;
        }

        // Update scores
        const updatedScores = { ...newGameState.scores };
        if (winnerUid) updatedScores[winnerUid] = (updatedScores[winnerUid] || 0) + 1;

        const resultPayload = {
            roomId: room.id,
            winnerUid,
            isDraw,
            choices: { [p1]: m1, [p2]: m2 },
            scores: updatedScores,
        };

        // Reset board for next round
        const finalState = {
            moves: {},
            scores: updatedScores,
        };

        return {
            newGameState: finalState,
            events: [{ type: "round-result", payload: resultPayload }],
        };
    },

    projectPublicState({ gameState, playerUid }) {
        return {
            scores: gameState.scores,
            myPendingMove: gameState.moves[playerUid] || null,
        };
    },
};
