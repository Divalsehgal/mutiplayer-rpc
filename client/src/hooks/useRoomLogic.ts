import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket, getPlayerUid } from '@/api/socket';
import { useRoomStore } from '../store/room';
import { useSocket } from './useSocket';
import { useSocketEvent } from './useSocketEvent';
import { RoomState } from '../types';
import { useAuthStore } from '../store/auth';
import { JoinRoomResponse } from '../types';

export function useRoomLogic(roomId: string | undefined) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { isConnected } = useSocket();
  const { room, setRoom, ttlWarning, setTtlWarning, reset } = useRoomStore();
  const playerUid = user?._id || user?.id || getPlayerUid();

  // Countdown for inactivity warning
  useEffect(() => {
    if (ttlWarning === null || ttlWarning <= 0) return;
    const interval = setInterval(() => {
      setTtlWarning(ttlWarning - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [ttlWarning, setTtlWarning]);

  // Auto-navigate to game arena when room status transitions to playing
  useEffect(() => {
    if (room?.status === 'playing' && roomId) {
      console.log(`🚀 Arena Ready for Room ${roomId}. Transitioning...`);
      navigate(`/game/${roomId}`, { replace: true });
    }
  }, [room?.status, roomId, navigate]);

  useEffect(() => {
    if (!isConnected || !roomId) return;

    const name = user?.user_name || sessionStorage.getItem('playerName') || "Player";
    const avatar = user?.avatar;

    type RegisterPayload = { playerUid: string; name: string; avatar?: string };
    type JoinPayload = { roomId: string; name: string; avatar?: string };

    const registerPayload: RegisterPayload = avatar ? { playerUid, name, avatar } : { playerUid, name };

    socket.emit('register', registerPayload, () => {
      const joinPayload: JoinPayload = avatar ? { roomId: roomId as string, name, avatar } : { roomId: roomId as string, name };

      socket.emit('join-room', joinPayload, (res: JoinRoomResponse) => {
        if (res?.ok && res.room) {
          setRoom(res.room);
        } else {
          console.error("Match not found or join failed:", res.error || res);
          setRoom(null);
        }
      });
    });
  }, [isConnected, roomId, playerUid, navigate, setRoom, user?.avatar, user?.user_name]);

  useSocketEvent("room-update", (updatedRoom: RoomState | null) => {
    if (!updatedRoom) {
      setRoom(null);
      return;
    }
    setRoom(updatedRoom);
  });

  useSocketEvent("ROOM_WARNING", ({ secondsLeft }: { secondsLeft: number }) => {
    setTtlWarning(secondsLeft);
  });

  useSocketEvent("room-error", (err: unknown) => {
    const code = (err as { code?: string } | null)?.code;
    if (code === "ROOM_EXPIRED") {
      setRoom(null);
      navigate('/');
    }
  });

  const handleStartGame = () => {
    if (!roomId) return;
    socket.emit('game-ready', { roomId });
  };

  const handleExtendSession = () => {
    if (!roomId) return;
    socket.emit('extend-room', { roomId }, () => setTtlWarning(null));
  };

  const handleLeave = () => {
    if (!roomId) return;
    socket.emit('leave-room', { roomId });
    reset();
    navigate('/');
  };

  return {
    room,
    playerUid,
    ttlWarning,
    handleStartGame,
    handleExtendSession,
    handleLeave
  };
}
