import { rpsGameHandler } from "./rps";
import { snakeLadderGameHandler } from "./snake-ladder";
import { ticTacToeGameHandler } from "./tic-tac-toe";
import { GameRegistry } from "../models";

export const gameRegistry: Record<string, GameRegistry> = {
    RPS: rpsGameHandler as any,
    SNAKE_LADDER: snakeLadderGameHandler as any,
    TIC_TAC_TOE: ticTacToeGameHandler as any,
};
