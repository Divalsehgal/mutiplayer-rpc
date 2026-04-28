import { AuthService } from './index';
import AuthModel from '../../models/auth';
import UserModel from '../../models/user';
import SessionModel from '../../models/session';
import jwt from 'jsonwebtoken';

jest.mock('../../models/auth');
jest.mock('../../models/user');
jest.mock('../../models/session');
jest.mock('jsonwebtoken');
jest.mock('mongoose', () => {
    const mongoose = jest.requireActual('mongoose');
    return {
        ...mongoose,
        startSession: jest.fn().mockResolvedValue({
            startTransaction: jest.fn(),
            commitTransaction: jest.fn(),
            abortTransaction: jest.fn(),
            endSession: jest.fn(),
        })
    };
});

describe('AuthService', () => {
    let authService: AuthService;

    beforeEach(() => {
        authService = new AuthService();
        jest.clearAllMocks();
    });

    it('should signin successfully', async () => {
        const mockAuth = {
            userId: 'user123',
            comparePassword: jest.fn().mockResolvedValue(true),
            getJWT: jest.fn().mockReturnValue({ accessToken: 'a', refreshToken: 'r' })
        };
        (AuthModel.findOne as jest.Mock).mockResolvedValue(mockAuth);
        (UserModel.findById as jest.Mock).mockResolvedValue({ _id: 'user123', user_name: 'test' });

        const result = await authService.signin({ email: 'test@test.com', password: 'password' });
        expect(result.tokens.accessToken).toBe('a');
        expect(result.user.user_name).toBe('test');
    });

    it('should signup successfully', async () => {
        const mockQuery = {
            session: jest.fn().mockResolvedValue(null)
        };
        (UserModel.findOne as jest.Mock).mockReturnValue(mockQuery);
        (AuthModel.findOne as jest.Mock).mockReturnValue(mockQuery);
        
        // Mocking class instance creation and save
        const mockUserSave = jest.fn().mockResolvedValue({ _id: 'u1', user_name: 'u' });
        const mockAuthSave = jest.fn().mockResolvedValue({});
        const mockGetJWT = jest.fn().mockReturnValue({ accessToken: 'a', refreshToken: 'r' });

        (UserModel as any).mockImplementation(() => ({
            save: jest.fn().mockReturnValue({ session: mockUserSave }),
            _id: 'u1',
            user_name: 'u'
        }));

        (AuthModel as any).mockImplementation(() => ({
            save: jest.fn().mockReturnValue({ session: mockAuthSave }),
            getJWT: mockGetJWT,
            _id: 'a1'
        }));

        (SessionModel as any).mockImplementation(() => ({
            save: jest.fn().mockReturnValue({ session: jest.fn().mockResolvedValue({}) })
        }));

        const result = await authService.signup({ email: 'n@n.com', user_name: 'u', password: 'p' });
        expect(result.tokens.accessToken).toBe('a');
    });

    it('should refresh tokens successfully', async () => {
        const mockTokens = { accessToken: 'a2', refreshToken: 'r2' };
        const mockAuth = {
            getJWT: jest.fn().mockReturnValue(mockTokens)
        };
        const mockSession = {
            save: jest.fn(),
            refreshToken: 'old'
        };

        (jwt.verify as jest.Mock).mockReturnValue({ _id: 'u1' });
        (SessionModel.findOne as jest.Mock).mockResolvedValue(mockSession);
        (AuthModel.findOne as jest.Mock).mockResolvedValue(mockAuth);
        (UserModel.findById as jest.Mock).mockResolvedValue({ _id: 'u1', user_name: 'u' });

        const result = await authService.refreshTokens('old');
        expect(result.accessToken).toBe('a2');
        expect(mockSession.save).toHaveBeenCalled();
    });

    it('should throw error if user not found on signin', async () => {
        (AuthModel.findOne as jest.Mock).mockResolvedValue(null);
        await expect(authService.signin({ email: 'test@test.com', password: 'password' }))
            .rejects.toThrow('Invalid Credentials');
    });

    it('should throw error if password invalid', async () => {
        const mockAuth = {
            comparePassword: jest.fn().mockResolvedValue(false)
        };
        (AuthModel.findOne as jest.Mock).mockResolvedValue(mockAuth);
        await expect(authService.signin({ email: 'test@test.com', password: 'wrong' }))
            .rejects.toThrow('Invalid Credentials');
    });

    it('should logout by deleting session', async () => {
        (SessionModel.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 1 });
        await authService.logout('token123');
        expect(SessionModel.deleteOne).toHaveBeenCalledWith({ refreshToken: 'token123' });
    });
});
