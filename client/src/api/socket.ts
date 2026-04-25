import { io, Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import type { ClientToServerEvents, ServerToClientEvents } from "../types/events";

// Deployment Ready: Use environment variable with local fallback
const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3030";

/**
 * Persistent Player UUID Helper
 */
export const getPlayerUid = (): string => {
    let clientUid = typeof window !== "undefined" ? sessionStorage.getItem("player_uid") : null;
    if (!clientUid && typeof window !== "undefined") {
        // Maintain prefixing for consistency with old store
        const randomPart = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
        clientUid = `p_${Date.now()}_${randomPart}`;
        sessionStorage.setItem("player_uid", clientUid);
    }
    return clientUid || uuidv4();
};

/**
 * Unified Typed Socket Instance
 * Handles all real-time communication with strict event typing.
 */
export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SERVER_URL, {
    autoConnect: false,
    transports: ["websocket"],
    auth: {
        playerUid: getPlayerUid(),
    },
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
});

// Helper for debugging in development
if (import.meta.env.DEV) {
    socket.on("connect", () => console.log("🔌 Socket connected:", socket.id));
    socket.on("disconnect", (reason) => console.log("🔌 Socket disconnected:", reason));
}

export default socket;
