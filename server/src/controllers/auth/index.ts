import { Request, Response, NextFunction } from "express"
import { AuthService } from "../../services/auth"
import { SignupRequest, SigninRequest } from "../../dtos/auth.dto";
import { setAuthCookies } from "./helpers";

export * from "./GoogleAuthController";

const authService = new AuthService();

export const signinHandler = async (req: Request, res: Response, _next: NextFunction) => {
    try {
        const credentials: SigninRequest = req.body;
        const metadata = { userAgent: req.headers["user-agent"], ip: req.ip };
        const { tokens } = await authService.signin(credentials, metadata);

        setAuthCookies(res, tokens);

        res.status(200).json({ 
            success: true,
            data: { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken }
        });
    } catch (err) {
        const error = err as Error;
        const status = error.message === "Invalid Credentials" ? 401 : 500;
        res.status(status).json({ success: false, message: error.message });
    }
};

export const signupHandler = async (req: Request, res: Response) => {
    try {
        const userData: SignupRequest = req.body;
        const metadata = { userAgent: req.headers["user-agent"], ip: req.ip };
        const { user, tokens } = await authService.signup(userData, metadata);

        setAuthCookies(res, tokens);

        res.status(201).json({ 
            success: true, 
            message: "User registered successfully",
            data: { 
                user: { id: user.id || (user as { _id?: string })._id, user_name: user.user_name, email: user.email }, 
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken
            }
        });
    } catch (err) {
        const error = err as Error;
        res.status(400).json({ success: false, message: error.message });
    }
};

export const refreshTokenHandler = async (req: Request, res: Response) => {
    try {
        const refreshToken = req.cookies.refresh_token;
        if (!refreshToken) {
            return res.status(401).json({ success: false, message: "Refresh token missing" });
        }
        const tokens = await authService.refreshTokens(refreshToken);
        setAuthCookies(res, tokens);
        res.status(200).json({ 
            success: true, 
            data: { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken }
        });
    } catch (err) {
        const error = err as Error;
        res.status(401).json({ success: false, message: error.message });
    }
};

export const logoutHandler = async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refresh_token;
    if (refreshToken) {
        await authService.logout(refreshToken);
    }
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    res.status(200).json({ success: true, message: "Logged out successfully" });
};
