import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket, getPlayerUid } from '../api/socket';
import { useRoomStore } from '../store/room';
import { useAuthStore } from '../store/auth';
import { useSocketEvent } from './useSocketEvent';
import { JoinRoomResponse } from '../types';

export function useGameLogic(roomId: string | undefined) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { room, setRoom, ttlWarning, setTtlWarning } = useRoomStore();
  const playerUid = user?._id || user?.id || getPlayerUid();

  // Countdown for inactivity warning
  useEffect(() => {
    if (ttlWarning === null || ttlWarning <= 0) return;
    const interval = setInterval(() => {
      setTtlWarning(ttlWarning - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [ttlWarning, setTtlWarning]);

  // Initial Join Logic (for refreshes)
  useEffect(() => {
    if (!roomId) return;

    // Register and then Join
    socket.emit("register", { playerUid, name: sessionStorage.getItem('playerName') || "Player" }, () => {
      socket.emit("join-room", { roomId, name: sessionStorage.getItem('playerName') || "Player" }, (res: JoinRoomResponse) => {
        if (res?.ok && res.room) {
          setRoom(res.room);
        } else {
          console.error("Match not found or join failed:", res);
          setRoom(null); // Explicitly mark as not found
        }
      });
    });
  }, [roomId, playerUid, setRoom]);

  useSocketEvent("room-update", (updatedRoom) => {
    if (!updatedRoom) {
      setRoom(null);
      return;
    }
    setRoom(updatedRoom);
  });

  useSocketEvent("ROOM_WARNING", ({ secondsLeft }) => {
    setTtlWarning(secondsLeft);
  });

  useSocketEvent("room-error", (err) => {
    if (err.code === "ROOM_EXPIRED") {
      setRoom(null);
      setTimeout(() => navigate('/'), 3000);
    }
  });

  const handleExtendSession = () => {
    if (!roomId) return;
    socket.emit('extend-room', { roomId }, () => setTtlWarning(null));
  };

  const handleLeave = () => {
    if (!roomId) return;
    socket.emit('leave-room', { roomId });
    navigate('/');
  };

  const handleRPSMove = (move: string) => {
    if (!roomId) return;
    socket.emit('game-move', { roomId, move });
  };

  const handleSnakeLadderMove = () => {
    if (!roomId) return;
    socket.emit('game-move', { roomId, move: 'roll' });
  };

  const handleTicTacToeMove = (index: number) => {
    if (!roomId) return;
    socket.emit('game-move', { roomId, move: index.toString() });
  };

  const handleNextRound = () => {
    if (!roomId) return;
    socket.emit('game-ready', { roomId });
  };

  return {
    room,
    playerUid,
    ttlWarning,
    handleExtendSession,
    handleLeave,
    handleRPSMove,
    handleSnakeLadderMove,
    handleTicTacToeMove,
    handleNextRound
  };
}
