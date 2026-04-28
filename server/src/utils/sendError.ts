import { Socket } from "socket.io";
import { isRoomError } from "../repositories/room/utils/error";

interface ErrorResponse {
    ok: false;
    code: string;
    error: string;
}

export const sendError = (
    cb: ((res: ErrorResponse) => void) | undefined,
    fallbackEvent: string | null,
    err: unknown,
    defaultCode: string,
    socket?: Socket
) => {
    const payload = isRoomError(err)
        ? { code: err.code, error: err.message }
        : { code: defaultCode, error: "Internal server error" };

    if (cb) return cb({ ok: false, ...payload });
    if (fallbackEvent && socket) socket.emit(fallbackEvent, payload);
};