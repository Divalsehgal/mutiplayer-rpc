import { Socket } from "socket.io";

export const sendError = (cb: any, fallbackEvent: string | null, err: any, defaultCode: string, socket?: Socket) => {
    const payload = err?.isRoomError
        ? { code: err.code, error: err.message }
        : { code: defaultCode, error: "Internal server error" };

    if (cb) return cb({ ok: false, ...payload });
    if (fallbackEvent && socket) socket.emit(fallbackEvent, payload);
};