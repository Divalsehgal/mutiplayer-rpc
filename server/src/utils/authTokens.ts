import jwt from "jsonwebtoken";

type TokenKind = "access" | "refresh";

const DEFAULT_SECRETS: Record<TokenKind, string> = {
    access: "access_secret_key",
    refresh: "refresh_secret_key",
};

const ENV_KEYS: Record<TokenKind, string> = {
    access: "JWT_SECRET",
    refresh: "REFRESH_TOKEN_SECRET",
};

export const getTokenSecret = (kind: TokenKind) => {
    const envKey = ENV_KEYS[kind];
    const secret = process.env[envKey];

    if (secret) return secret;

    if (process.env.NODE_ENV === "production") {
        throw new Error(`${envKey} must be set in production`);
    }

    return DEFAULT_SECRETS[kind];
};

export const signAccessToken = (payload: object) =>
    jwt.sign(payload, getTokenSecret("access"), { expiresIn: "1h" });

export const signRefreshToken = (payload: object) =>
    jwt.sign(payload, getTokenSecret("refresh"), { expiresIn: "7d" });

export const verifyAccessToken = <T>(token: string) =>
    jwt.verify(token, getTokenSecret("access")) as T;

export const verifyRefreshToken = <T>(token: string) =>
    jwt.verify(token, getTokenSecret("refresh")) as T;
