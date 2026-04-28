import { Socket, Server } from "socket.io";
import { GameController } from "../../controllers/game";

export function registerGameRoutes(io: Server, socket: Socket, controller: GameController) {
    socket.on("game-ready", (data) => controller.handleReady(socket, data));
    socket.on("game-move", (data) => controller.handleMove(socket, data));
}
