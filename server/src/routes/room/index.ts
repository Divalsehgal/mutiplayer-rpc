import { Socket, Server } from "socket.io";
import { RoomController } from "../../controllers/room";

export function registerRoomRoutes(io: Server, socket: Socket, controller: RoomController) {
    socket.on("create-room", (data, callback) => controller.createRoom(socket, data, callback));
    socket.on("join-room", (data, callback) => controller.joinRoom(socket, data, callback));
    socket.on("leave-room", (data) => controller.leaveRoom(socket, data));
    socket.on("extend-room", (data, callback) => controller.extendRoom(socket, data, callback));
    socket.on("get-public-rooms", (callback) => controller.getPublicRooms(socket, callback));
}

