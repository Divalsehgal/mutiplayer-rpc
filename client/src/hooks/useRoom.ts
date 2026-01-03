import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "@/api/socket";
import { typedSocket } from "@/api/typedSocket";
import { getOrCreatePlayerUid, getPlayerName } from "@/store/playerStore";
import type { RoomState, RoundResult } from "@/types";

export function useRoom(roomId?: string | null) {

  const navigate = useNavigate();

  const [room, setRoom] = useState<RoomState | null>(null);
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [history, setHistory] = useState<RoundResult[]>([]);


  useEffect(() => {
    if (!roomId) return;

    setLoading(true);

    const playerUid = getOrCreatePlayerUid();
    const name = getPlayerName() || "Player";

    if (!socket.connected) socket.connect();

    const joinCallback = (res: any) => {
      if (res?.ok && res.room) {
        setRoom(res.room);
        setLoading(false);
      } else {
        // failed to join (room not found or other error) — navigate home
        console.error("Failed to join room:", res);
        setLoading(false);
        try {
          navigate("/", { replace: true });
        } catch (e) {
          // ignore
        }
      }
    };

    typedSocket.emit("register", { playerUid, name }, (regRes: any) => {
      if (!regRes?.ok) {
        console.error("Register failed:", regRes);
        // still attempt to join, server may accept
      }
      typedSocket.emit("join-room", { roomId, playerUid, name } as any, joinCallback as any);
    });

    const handleRoomUpdate = (updated: RoomState | null) => {
      if (!updated) {
        // room removed
        try {
          navigate("/", { replace: true });
        } catch (e) {}
        return;
      }
      setRoom(updated);
    };

      const handleRoundResult = (r: RoundResult) => {
          setHistory(prev => [...prev, r]); // <- add to history
          setRoundResult(r);
          setTimeout(() => setRoundResult(null), 9000);
      };

    typedSocket.on("room-update", handleRoomUpdate);
    typedSocket.on("round-result", handleRoundResult);
    typedSocket.on("room-closed", ({ roomId: closedId }: { roomId: string }) => {

      if (closedId === roomId) {
        try {
          navigate("/", { replace: true });
        } catch (e) {}
      }

    });

    return () => {
      typedSocket.off("room-update", handleRoomUpdate);
      typedSocket.off("round-result", handleRoundResult);
      typedSocket.off("room-closed");
    };

  }, [roomId, navigate]);

  const requestPlayerSlot = useCallback(() => {
    if (!roomId) return;
    typedSocket.emit("request-player-slot", { roomId, playerUid: getOrCreatePlayerUid() } as any);
  }, [roomId]);

    return { room, roundResult, history, loading, requestPlayerSlot };

}

export default useRoom;
