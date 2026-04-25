import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket, getPlayerUid } from '../api/socket';
import { useRoomStore } from '../store/roomStore';
import { useSocketEvent } from '../hooks/useSocketEvent';
import { RoomState } from '../types';

export function useGameLogic(roomId: string | undefined) {
  const navigate = useNavigate();
  const { room, setRoom, ttlWarning, setTtlWarning } = useRoomStore();
  const playerUid = getPlayerUid();

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
      socket.emit("join-room", { roomId, name: sessionStorage.getItem('playerName') || "Player" }, (res: any) => {
        if (res?.ok && res.room) {
          setRoom(res.room);
        } else {
          console.error("Match not found or join failed:", res);
          setRoom(null as any); // Explicitly mark as not found
        }
      });
    });
  }, [roomId, playerUid, setRoom]);

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
