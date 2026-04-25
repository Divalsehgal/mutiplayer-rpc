import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Socket } from "socket.io-client";
import { Sword, Shield, Scissors, ArrowRight, Trophy } from "lucide-react";
import type { RoomState, RoundResult, Player } from "@/types";
import { Scoreboard } from "../Scoreboard";
import { Result as RoundResultDisplay } from "../Result";

const CHOICES = {
  Rock: { name: "Rock", icon: Sword },
  Paper: { name: "Paper", icon: Shield },
  Scissors: { name: "Scissors", icon: Scissors }
} as const;

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
  const hasSelected = !!(room.gameState as any)?.playerChoices?.[playerUid || ""];
  const iAmReadyForNext = room.gameState?.readyPlayers?.includes(playerUid);
  const playersOnly = room.players.filter(p => p.role === "player") as Player[];

  return (
    <div className="flex flex-col gap-10 w-full relative">
      <Scoreboard players={playersOnly} myUid={playerUid} room={room} />

      <div className="w-full relative">
        <AnimatePresence mode="wait">
          {isPlaying ? (
            <motion.div
              key="playing"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="w-full max-w-4xl mx-auto flex flex-col items-center gap-12 py-8"
              style={{ margin: '0 auto' }}
            >
              <div className="flex flex-col items-center gap-4 text-center">
                <motion.h2 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl font-black italic tracking-tighter arcade-font text-white uppercase"
                >
                  {hasSelected ? "Move Locked" : "Choose Your Move"}
                </motion.h2>
                <div className="flex items-center gap-4">
                  <div className="badge-terminal px-5 py-1 bg-primary/10 border border-primary/20 text-primary">
                    ROUND {(room.gameState as any)?.roundCount}
                  </div>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-[10px] font-black tracking-[0.3em] text-primary opacity-60 uppercase"
                  >
                    {hasSelected ? "Waiting for opponent..." : "Select your move to engage"}
                  </motion.p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full px-4">
                {(Object.keys(CHOICES) as (keyof typeof CHOICES)[]).map((choice, index) => {
                  const Icon = CHOICES[choice].icon;
                  const isChoiceSelected = ((room.gameState as any)?.playerChoices?.[playerUid] === choice) || (selected === choice);
                  
                  return (
                    <motion.button
                      key={choice}
                      initial={{ opacity: 0, scale: 0.8, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={!hasSelected ? { scale: 1.05, y: -5 } : {}}
                      whileTap={!hasSelected ? { scale: 0.95 } : {}}
                      disabled={hasSelected || !isPlayer}
                      onClick={() => handleSelect(choice)}
                      className={`group relative p-8 rounded-3xl border-2 transition-all flex flex-col items-center gap-6 overflow-hidden arcade-panel bg-black/40 backdrop-blur-md ${
                        isChoiceSelected 
                          ? 'border-primary shadow-[0_0_50px_rgba(var(--primary-rgb),0.3)]' 
                          : hasSelected 
                            ? 'opacity-40 grayscale pointer-events-none'
                            : 'border-white/5 hover:border-primary/40'
                      }`}
                    >
                      {/* CRT Effect on buttons */}
                      <div className="absolute inset-0 pointer-events-none opacity-20 z-10" 
                           style={{ backgroundImage: 'linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.1) 50%), linear-gradient(90deg, rgba(255,0,0,0.02), rgba(0,255,0,0.01), rgba(0,0,255,0.02))', backgroundSize: '100% 2px, 3px 100%' }} />
                      
                      <div className={`p-6 rounded-2xl transition-colors relative z-20 ${
                        isChoiceSelected ? 'bg-primary/20' : 'bg-white/5 group-hover:bg-primary/10'
                      }`}>
                        <Icon size={48} className={isChoiceSelected ? 'text-primary animate-pulse' : 'text-white group-hover:text-primary'} />
                      </div>

                      <div className="flex flex-col items-center gap-1 relative z-20">
                        <span className={`text-xl font-black italic arcade-font ${isChoiceSelected ? 'text-primary' : 'text-white'}`}>
                          {choice.toUpperCase()}
                        </span>
                        <div className={`h-1 w-12 rounded-full transition-all ${isChoiceSelected ? 'bg-primary' : 'bg-white/10 group-hover:bg-primary/40'}`} />
                      </div>

                      {isChoiceSelected && (
                        <motion.div 
                          layoutId="selection-glow"
                          className="absolute inset-0 bg-primary/5 blur-3xl"
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {hasSelected && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 px-6 py-3 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm"
                >
                  <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                  <span className="text-[10px] font-black tracking-widest text-primary uppercase">Waiting for other players...</span>
                </motion.div>
              )}
            </motion.div>
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
            <motion.div 
              key="standby"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="arcade-panel rounded-[4rem] border-2 border-white/5 p-24 text-center bg-black/40 backdrop-blur-2xl flex flex-col items-center gap-8 relative overflow-hidden"
            >
                <div className="absolute inset-0 pointer-events-none opacity-20 z-10" 
                     style={{ backgroundImage: 'linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.1) 50%), linear-gradient(90deg, rgba(255,0,0,0.02), rgba(0,255,0,0.01), rgba(0,0,255,0.02))', backgroundSize: '100% 2px, 3px 100%' }} />
                <div className="relative z-20">
                    <Trophy size={80} className="text-primary/20 mb-6 mx-auto animate-pulse" />
                    <div className="flex flex-col gap-4">
                        <span className="text-[12px] font-black tracking-[0.5em] text-primary/40 uppercase font-mono">STANDBY</span>
                        <h3 className="text-4xl font-black italic arcade-font text-white uppercase">
                            {room.players.filter(p => p.role === "player").length < room.maxPlayers ? "Awaiting Challenger" : "Awaiting Players"}
                        </h3>
                        {!isPlayer && room.players.filter(p => p.role === "player").length < room.maxPlayers && (
                            <div className="mt-6">
                                <button
                                    onClick={() => socket.emit("request-player-slot", { roomId })}
                                    className="px-8 py-3 rounded-xl bg-primary/20 border border-primary/50 text-primary font-black uppercase tracking-widest hover:bg-primary/30 transition-all hover:scale-105 active:scale-95"
                                >
                                    Join Game
                                </button>
                            </div>
                        )}
                        <p className="text-[10px] font-black tracking-[0.3em] text-white/20 uppercase mt-4">
                          Waiting for players to join the arena
                        </p>
                    </div>
                </div>
                {/* Decorative scanning line */}
                <motion.div 
                  animate={{ y: [0, 400, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 right-0 h-[2px] bg-primary/20 blur-sm z-30"
                />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
