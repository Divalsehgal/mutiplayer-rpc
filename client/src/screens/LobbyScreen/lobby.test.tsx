import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LobbyScreen from './index';
import { BrowserRouter } from 'react-router-dom';
import { socket } from '../../api/socket';

vi.mock('../../api/socket', () => ({
  socket: {
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  },
  getPlayerUid: () => 'uid123',
}));

const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual as any,
    useNavigate: () => mockedNavigate,
  };
});

describe('LobbyScreen', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        window.alert = vi.fn();
        (socket.emit as any).mockImplementation((event: string, ...args: any[]) => {
            if (event === 'get-public-rooms') {
                const cb = args[0];
                cb?.({ ok: true, rooms: [] });
            }
        });
    });

    it('should render the create-room and public-rooms sections', () => {
        render(
            <BrowserRouter>
                <LobbyScreen />
            </BrowserRouter>
        );
        expect(screen.getByText(/FORGE NEW ARENA/i)).toBeDefined();
        expect(screen.getByText(/DIRECT ACCESS/i)).toBeDefined();
        expect(screen.getByText(/GLOBAL PORTAL/i)).toBeDefined();
    });

    it('should allow entering a player handle', () => {
        render(
            <BrowserRouter>
                <LobbyScreen />
            </BrowserRouter>
        );
        const nameInput = screen.getByPlaceholderText(/ENTER YOUR HANDLE/i) as HTMLInputElement;
        fireEvent.change(nameInput, { target: { value: 'JOHN' } });
        expect(nameInput.value).toBe('JOHN');
    });

    it('should alert instead of creating a room when the name is too short', () => {
        render(
            <BrowserRouter>
                <LobbyScreen />
            </BrowserRouter>
        );

        fireEvent.click(screen.getByText(/LAUNCH ARENA/i));

        expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Enter a player name'));
        expect(socket.emit).not.toHaveBeenCalledWith('create-room', expect.anything(), expect.anything());
    });

    it('should create a room and navigate to it on success', () => {
        (socket.emit as any).mockImplementation((event: string, ...args: any[]) => {
            if (event === 'get-public-rooms') {
                args[0]?.({ ok: true, rooms: [] });
            }
            if (event === 'create-room') {
                const cb = args[1];
                cb?.({ ok: true, roomId: 'abc123' });
            }
        });

        render(
            <BrowserRouter>
                <LobbyScreen />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByPlaceholderText(/ENTER YOUR HANDLE/i), { target: { value: 'JOHN' } });
        fireEvent.click(screen.getByText(/LAUNCH ARENA/i));

        expect(socket.emit).toHaveBeenCalledWith(
            'create-room',
            expect.objectContaining({ hostName: 'JOHN', gameType: 'RPS' }),
            expect.any(Function)
        );
        expect(mockedNavigate).toHaveBeenCalledWith('/room/abc123');
    });

    it('should alert when room creation fails', () => {
        (socket.emit as any).mockImplementation((event: string, ...args: any[]) => {
            if (event === 'get-public-rooms') {
                args[0]?.({ ok: true, rooms: [] });
            }
            if (event === 'create-room') {
                const cb = args[1];
                cb?.({ ok: false, error: 'Creation failed' });
            }
        });

        render(
            <BrowserRouter>
                <LobbyScreen />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByPlaceholderText(/ENTER YOUR HANDLE/i), { target: { value: 'JOHN' } });
        fireEvent.click(screen.getByText(/LAUNCH ARENA/i));

        expect(window.alert).toHaveBeenCalledWith('Creation failed');
        expect(mockedNavigate).not.toHaveBeenCalled();
    });

    it('should join a room by ID and navigate to it on success', () => {
        (socket.emit as any).mockImplementation((event: string, ...args: any[]) => {
            if (event === 'get-public-rooms') {
                args[0]?.({ ok: true, rooms: [] });
            }
            if (event === 'join-room') {
                const cb = args[1];
                cb?.({ ok: true });
            }
        });

        render(
            <BrowserRouter>
                <LobbyScreen />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByPlaceholderText(/ENTER YOUR HANDLE/i), { target: { value: 'JOHN' } });
        fireEvent.change(screen.getByPlaceholderText(/ROOM ID/i), { target: { value: 'xyz1' } });
        fireEvent.click(screen.getByText(/^JOIN$/i));

        expect(socket.emit).toHaveBeenCalledWith(
            'join-room',
            expect.objectContaining({ roomId: 'XYZ1', name: 'JOHN' }),
            expect.any(Function)
        );
        expect(mockedNavigate).toHaveBeenCalledWith('/room/XYZ1');
    });

    it('should alert when the room to join is not found', () => {
        (socket.emit as any).mockImplementation((event: string, ...args: any[]) => {
            if (event === 'get-public-rooms') {
                args[0]?.({ ok: true, rooms: [] });
            }
            if (event === 'join-room') {
                const cb = args[1];
                cb?.({ ok: false, error: 'Room not found' });
            }
        });

        render(
            <BrowserRouter>
                <LobbyScreen />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByPlaceholderText(/ENTER YOUR HANDLE/i), { target: { value: 'JOHN' } });
        fireEvent.change(screen.getByPlaceholderText(/ROOM ID/i), { target: { value: 'nope' } });
        fireEvent.click(screen.getByText(/^JOIN$/i));

        expect(window.alert).toHaveBeenCalledWith('Room not found');
    });

    it('should render public rooms fetched on mount and join one on click', () => {
        (socket.emit as any).mockImplementation((event: string, ...args: any[]) => {
            if (event === 'get-public-rooms') {
                args[0]?.({
                    ok: true,
                    rooms: [{ id: 'room1', hostName: 'Host', players: [], maxPlayers: 2, gameType: 'RPS' }]
                });
            }
            if (event === 'join-room') {
                const cb = args[1];
                cb?.({ ok: true });
            }
        });

        render(
            <BrowserRouter>
                <LobbyScreen />
            </BrowserRouter>
        );

        expect(screen.getAllByText(/room1/i).length).toBeGreaterThan(0);

        fireEvent.change(screen.getByPlaceholderText(/ENTER YOUR HANDLE/i), { target: { value: 'JOHN' } });
        fireEvent.click(screen.getByText(/JOIN ARENA/i));

        expect(socket.emit).toHaveBeenCalledWith(
            'join-room',
            expect.objectContaining({ roomId: 'room1', name: 'JOHN' }),
            expect.any(Function)
        );
    });
});
