export const logger = {
    info: (...msg: any[]) => console.log("[INFO]", ...msg),
    error: (...msg: any[]) => console.error("[ERROR]", ...msg),
};
