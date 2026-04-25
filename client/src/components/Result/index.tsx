import { RoundResult, RoomState } from "@/types";
import { motion } from "framer-motion";
import { LucideIcon, Trophy, Skull, Handshake, Sword, Shield, Scissors } from "lucide-react";

export const Result = ({
  lastResult,
  room,
  myUid,
}: {
  lastResult: RoundResult;
  room: RoomState;
  myUid: string | undefined;
}) => {
  if (!lastResult) return null;

  const players = room.players || [];

  const getName = (uid: string) => {
    if (lastResult.playerNames?.[uid]) return lastResult.playerNames[uid];
    const p = players.find((x) => x.playerUid === uid);
    return p?.name || uid.slice(0, 4);
  };

  const winnerName = lastResult.winnerUid
    ? getName(lastResult.winnerUid)
    : null;
  const iWon = lastResult.winnerUid === myUid;

  const CHOICES_CONFIG: Record<string, { icon: LucideIcon, color: string }> = {
    Rock: { icon: Sword, color: "text-blue-400" },
    Paper: { icon: Shield, color: "text-purple-400" },
    Scissor: { icon: Scissors, color: "text-rose-400" }
  };

  return (
    <div className="w-full relative">
      <div className="flex flex-col gap-8 w-full">
        {/* Outcome Banner */}
        <motion.div
           initial={{ opacity: 0, scale: 0.8, y: -20 }}
           animate={{ opacity: 1, scale: 1, y: 0 }}
           className="w-full"
        >
          <div className={`relative p-10 rounded-[3rem] border flex flex-col items-center gap-4 overflow-hidden transition-all duration-700 bg-black/20 backdrop-blur-xl ${
              lastResult.isDraw ? 'border-white/5' : iWon ? 'border-primary/20 shadow-[0_0_50px_rgba(var(--primary-rgb),0.15)]' : 'border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.15)]'
          }`}>
             {/* Background Glow */}
             <div className="absolute inset-0 blur-[100px] opacity-20 pointer-events-none" 
                  style={{ backgroundColor: lastResult.isDraw ? '#9ca3af' : iWon ? 'var(--primary)' : '#ef4444' }} />

             <motion.div
                animate={{ rotate: iWon ? [0, -10, 10, -10, 10, 0] : 0 }}
                transition={{ duration: 0.5, repeat: iWon ? Infinity : 0, repeatDelay: 3 }}
                className="relative z-10"
             >
                {lastResult.isDraw ? <Handshake size={48} style={{ color: '#9ca3af', filter: 'drop-shadow(0 0 15px rgba(156,163,175,0.3))' }} /> : 
                 iWon ? <Trophy size={48} className="text-primary" style={{ filter: 'drop-shadow(0 0 20px rgba(var(--primary-rgb),0.4))' }} /> : 
                 <Skull size={48} style={{ color: '#ef4444', filter: 'drop-shadow(0 0 20px rgba(239,68,68,0.4))' }} />}
             </motion.div>

             <div className="flex flex-col items-center gap-0 relative z-10">
                <span className="text-[10px] font-black tracking-[0.4em] opacity-40 uppercase text-white">
                    {lastResult.isDraw ? 'CONFLICT_NEUTRALIZED' : iWon ? 'AUTHORITY_ESTABLISHED' : 'SYSTEM_FAILURE'}
                </span>
                <span className="text-5xl font-black tracking-tighter uppercase arcade-font"
                      style={{ color: lastResult.isDraw ? 'white' : iWon ? 'var(--primary)' : '#ef4444' }}>
                    {lastResult.isDraw ? 'STALEMATE' : iWon ? 'VICTORY' : 'DEFEAT'}
                </span>
             </div>

             {!lastResult.isDraw && !iWon && (
                 <span className="text-[10px] font-black opacity-60 tracking-widest uppercase relative z-10 text-white">
                     OVERRIDDEN BY: {winnerName?.toUpperCase()}
                 </span>
             )}
          </div>
        </motion.div>

        {/* Action Replay */}
        <div className="flex flex-row gap-6 w-full justify-center">
          {Object.entries(lastResult.choices).map(([uid, choice], i) => {
            const isMe = uid === myUid;
            const config = CHOICES_CONFIG[choice as string];
            
            return (
              <motion.div
                key={uid}
                initial={{ opacity: 0, x: i === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex-1 max-w-[180px]"
              >
                <div 
                  className={`relative p-6 rounded-3xl border flex flex-col items-center gap-4 transition-all duration-500 bg-black/20 backdrop-blur-md ${
                    isMe ? 'border-primary/20 shadow-[0_0_20px_rgba(var(--primary-rgb),0.05)]' : 'border-white/5'
                  }`}
                >
                  <span className="text-[10px] font-black tracking-widest opacity-40 uppercase text-white">
                    {isMe ? "LOCAL_USER" : "REMOTE_HOST"}
                  </span>
                  
                  <div className={`p-5 rounded-2xl bg-white/5 transition-transform hover:scale-110 duration-300`}
                       style={{ color: config?.color === 'text-blue-400' ? '#60a5fa' : config?.color === 'text-purple-400' ? '#c084fc' : '#fb7185' }}>
                    {config?.icon && <config.icon size={36} />}
                  </div>
                  
                  <span className="text-[10px] font-black px-4 py-1 border border-white/10 text-white/40 rounded-full uppercase tracking-tighter bg-white/5">
                    {choice as string}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
