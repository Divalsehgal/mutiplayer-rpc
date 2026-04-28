import { initSocket } from "./index";
import jwt from "jsonwebtoken";

jest.mock("jsonwebtoken");

describe("Socket Auth Middleware", () => {
    let mockIo: any;
    let mockLogger: any;
    let middleware: (socket: any, next: (err?: Error) => void) => void;

    beforeEach(() => {
        mockIo = { 
            use: jest.fn((fn) => middleware = fn),
            on: jest.fn()
        };
        mockLogger = { info: jest.fn(), error: jest.fn(), warn: jest.fn() };
        
        initSocket({ 
            io: mockIo, 
            roomStore: {} as any, 
            gameRegistry: {}, 
            logger: mockLogger 
        });
    });

    it("should authenticate with valid token", () => {
        const socket: any = { handshake: { auth: { token: "valid" } }, data: {} };
        const next = jest.fn();
        (jwt.verify as jest.Mock).mockReturnValue({ _id: "u1", user_name: "test" });

        middleware(socket, next);
        
        expect(socket.data.playerUid).toBe("u1");
        expect(next).toHaveBeenCalledWith();
    });

    it("should fail with invalid token", () => {
        const socket: any = { handshake: { auth: { token: "invalid" } }, data: {} };
        const next = jest.fn();
        (jwt.verify as jest.Mock).mockImplementation(() => { throw new Error("Invalid"); });

        middleware(socket, next);
        
        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(mockLogger.error).toHaveBeenCalled();
    });

    it("should fall back to playerUid if no token", () => {
        const socket: any = { handshake: { auth: { playerUid: "anon1" } }, data: {} };
        const next = jest.fn();

        middleware(socket, next);
        
        expect(socket.data.playerUid).toBe("anon1");
        expect(next).toHaveBeenCalledWith();
    });

    it("should fail if no token and no playerUid", () => {
        const socket: any = { handshake: { auth: {} }, data: {} };
        const next = jest.fn();

        middleware(socket, next);
        
        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(mockLogger.error).toHaveBeenCalled();
    });
});
