import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket, getPlayerUid } from '../api/socket';
import { useRoomStore } from '../store/roomStore';
import { useSocketEvent } from '../hooks/useSocketEvent';
import { useSocket } from '../hooks/useSocket';
import { RoomState } from '../types';

export function useRoomLogic(roomId: string | undefined) {
  const navigate = useNavigate();
  const { isConnected } = useSocket();
  const { room, setRoom, ttlWarning, setTtlWarning, reset } = useRoomStore();
  const playerUid = getPlayerUid();

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
      navigate(`/game/${roomId}`);
    }
  }, [room?.status, roomId, navigate]);

  useEffect(() => {
    if (!isConnected || !roomId) return;
    
    socket.emit("register", { playerUid, name: sessionStorage.getItem('playerName') || "Player" }, () => {
      socket.emit("join-room", { roomId, name: sessionStorage.getItem('playerName') || "Player" }, (res: any) => {
        if (res?.ok && res.room) {
          setRoom(res.room);
        } else {
          console.error("Match not found or join failed:", res.error || res);
          setRoom(null as any);
        }
      });
    });
  }, [isConnected, roomId, playerUid, navigate, setRoom]);

  useSocketEvent<RoomState>("room-update", (updatedRoom) => {
    if (!updatedRoom) {
      setRoom(null as any);
      return;
    }
    setRoom(updatedRoom);
  });

  useSocketEvent<{ secondsLeft: number }>("ROOM_WARNING", ({ secondsLeft }) => {
    setTtlWarning(secondsLeft);
  });

  useSocketEvent<{ code: string; message: string }>("room-error", (err) => {
    if (err.code === "ROOM_EXPIRED") {
      setRoom(null as any);
      setTimeout(() => navigate('/'), 3000); // Give user 3s to read the "Expired" state
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
