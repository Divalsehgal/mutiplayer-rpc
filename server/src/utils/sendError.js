const sendError = (cb, fallbackEvent, err, defaultCode) => {
    const payload = err?.isRoomError
        ? { code: err.code, error: err.message }
        : { code: defaultCode, error: "Internal server error" };

    if (cb) return cb({ ok: false, ...payload });
    if (fallbackEvent) socket.emit(fallbackEvent, payload);
};

module.exports = { sendError };