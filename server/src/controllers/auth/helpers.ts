import { Response } from "express";

export const setAuthCookies = (res: Response, tokens: { accessToken: string; refreshToken: string }) => {
    res.cookie('access_token', tokens.accessToken, {
        httpOnly: true,
        maxAge: 1 * 3600000, // 1 hour
    });
    res.cookie('refresh_token', tokens.refreshToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 3600000, // 7 days
    });
};
