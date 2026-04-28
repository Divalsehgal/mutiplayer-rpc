export * from "./player/Player";
export * from "./room/Room";
export * from "./game/Game";

import { Server } from "socket.io";
import { RoomRepository } from "../repositories/room";
import { GameRegistry } from "./game/Game";

export interface Logger {
    info: (...msg: unknown[]) => void;
    warn: (...msg: unknown[]) => void;
    error: (...msg: unknown[]) => void;
}

export interface InitSocketArgs {
    io: Server;
    roomStore: RoomRepository;
    gameRegistry: Record<string, GameRegistry>;
    logger: Logger;
}
