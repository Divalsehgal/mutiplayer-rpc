export const logger = {
    info: (...msg: unknown[]) => console.log("[INFO]", ...msg),
    error: (...msg: unknown[]) => console.error("[ERROR]", ...msg),
};
