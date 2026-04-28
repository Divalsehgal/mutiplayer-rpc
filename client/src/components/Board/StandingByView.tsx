import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { Socket } from "socket.io-client";
import { RoomState } from "@/types";

interface StandingByViewProps {
  room: RoomState;
  roomId: string;
  socket: Socket;
  isPlayer: boolean;
}

export const StandingByView = ({ room, roomId, socket, isPlayer }: StandingByViewProps) => {
  return (
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
  );
};
