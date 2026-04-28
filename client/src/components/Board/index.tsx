import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Socket } from "socket.io-client";
import { ArrowRight } from "lucide-react";
import type { RoomState, RoundResult, Player, RPSState } from "@/types";
import { Scoreboard } from "../Scoreboard";
import { Result as RoundResultDisplay } from "../Result";
import { PlayingView } from "./PlayingView";
import { StandingByView } from "./StandingByView";

export interface BoardProps {
  room: RoomState;
  roomId: string;
  socket: Socket;
  lastResult: RoundResult | null;
  readyForNextRound: () => void;
  playerUid: string;
  isPlayer: boolean;
}

export const Board = ({ 
  room, 
  roomId, 
  socket, 
  lastResult, 
  readyForNextRound, 
  playerUid, 
  isPlayer 
}: BoardProps) => {
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (room.gameState?.status === "playing") {
      setSelected(null);
    }
  }, [room.gameState?.status]);

  const handleSelect = (choice: string) => {
    if (!isPlayer) return;
    setSelected(choice);
    socket.emit("game-move", { roomId, move: choice, playerUid });
  };

  const isPlaying = room.gameState?.status === "playing";
  const isWaitingForNext = room.gameState?.status === "waiting_for_ready";
  const rpsState = room.gameState as RPSState;
  const hasSelected = !!rpsState?.playerChoices?.[playerUid || ""];
  const iAmReadyForNext = room.gameState?.readyPlayers?.includes(playerUid);
  const playersOnly = room.players.filter(p => p.role === "player") as Player[];

  return (
    <div className="flex flex-col gap-10 w-full relative">
      <Scoreboard players={playersOnly} myUid={playerUid} room={room} />

      <div className="w-full relative">
        <AnimatePresence mode="wait">
          {isPlaying ? (
            <PlayingView 
              room={room}
              playerUid={playerUid}
              isPlayer={isPlayer}
              hasSelected={hasSelected}
              selected={selected}
              handleSelect={handleSelect}
            />
          ) : isWaitingForNext && lastResult ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full flex flex-col gap-10 items-center"
            >
              <div className="w-full bg-black/20 border border-white/5 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden backdrop-blur-2xl">
                <div className="absolute inset-0 pointer-events-none opacity-20 z-10" 
                     style={{ backgroundImage: 'linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.1) 50%), linear-gradient(90deg, rgba(255,0,0,0.02), rgba(0,255,0,0.01), rgba(0,0,255,0.02))', backgroundSize: '100% 2px, 3px 100%' }} />
                <RoundResultDisplay lastResult={lastResult} room={room} myUid={playerUid} />
              </div>
              
               {isPlayer && (
                 <button
                  onClick={readyForNextRound}
                  disabled={iAmReadyForNext}
                  className="button-terminal h-16 w-64 uppercase text-sm tracking-widest border border-primary/40 bg-primary/5 text-primary hover:bg-primary/20 transition-all flex items-center justify-center gap-2"
                  style={{ transform: 'scale(1.25)' }}
                >
                  {iAmReadyForNext ? "READY" : "NEXT ROUND"}
                  <ArrowRight size={20} />
                </button>
              )}
            </motion.div>
          ) : (
            <StandingByView 
              room={room}
              roomId={roomId}
              socket={socket}
              isPlayer={isPlayer}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
