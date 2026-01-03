import { socket } from "./socket";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
} from "@/types/events";


/**
 * Minimal typed wrapper around the raw socket.io client to provide
 * compile-time checks for event names and payload shapes.
 */
export const typedSocket = {
  emit<K extends keyof ClientToServerEvents>(
    event: K,
    payload?: Omit<ClientToServerEvents[K], "cb">,
    cb?: (res: any) => void
  ) {
    // socket.emit accepts variable args; pass cb when provided
    if (cb) (socket as any).emit(event as string, payload, cb);
    else (socket as any).emit(event as string, payload);
  },

  on<K extends keyof ServerToClientEvents>(
    event: K,
    handler: (payload: ServerToClientEvents[K]) => void
  ) {
    (socket as any).on(event as string, handler);
  },

  off<K extends keyof ServerToClientEvents>(
    event: K,
    handler?: (payload: ServerToClientEvents[K]) => void
  ) {
    if (handler) (socket as any).off(event as string, handler);
    else (socket as any).off(event as string);
  },

  connect() {
    socket.connect();
  },

  disconnect() {
    socket.disconnect();
  },
};

export default typedSocket;
