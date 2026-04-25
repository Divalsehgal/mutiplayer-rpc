export * from "./player/Player";
export * from "./room/Room";
export * from "./game/Game";

import { Server } from "socket.io";
import { RoomRepository } from "../repositories/RoomRepository";
import { GameRegistry } from "./game/Game";

export interface Logger {
    info: (...msg: any[]) => void;
    error: (...msg: any[]) => void;
}

export interface InitSocketArgs {
    io: Server;
    roomStore: RoomRepository;
    gameRegistry: Record<string, GameRegistry>;
    logger: Logger;
}
