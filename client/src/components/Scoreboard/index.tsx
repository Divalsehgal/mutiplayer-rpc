import { Player, RoomState } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

export const Scoreboard = ({
  players,
  myUid,
  room,
}: {
  players: Player[];
  myUid: string | undefined;
  room: RoomState;
}) => {
  return (
    <div className="w-full relative px-4">
      <div className="flex flex-wrap justify-center items-center gap-4 w-full max-w-5xl mx-auto">
        <AnimatePresence mode="popLayout">
          {players.length > 0 ? (
            players.map((p, idx) => (
              <PlayerScoreSlot 
                key={p.playerUid || idx}
                player={p} 
                isMe={p.playerUid === myUid} 
                score={p.score ?? 0}
                isReady={room.gameState?.status !== 'playing' ? room.gameState?.readyPlayers?.includes(p.playerUid) : false}
                isWaiting={room.gameState?.status !== "playing"}
                index={idx + 1}
              />
            ))
          ) : (
             <div className="w-full h-24 arcade-panel rounded-3xl flex flex-col items-center justify-center gap-2 border border-white/5">
                <div className="w-6 h-6 rounded-full border-2 border-t-primary animate-spin" 
                     style={{ borderColor: 'rgba(var(--primary-rgb), 0.2)', borderTopColor: 'var(--primary)' }} />
                <span className="text-[10px] font-black tracking-[0.4em] uppercase text-center"
                      style={{ color: 'rgba(var(--primary-rgb), 0.4)' }}>SEARCHING...</span>
             </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const PlayerScoreSlot = ({ 
  player, 
  isMe, 
  score, 
  isReady, 
  isWaiting, 
  index 
}: { 
  player: Player | undefined, 
  isMe: boolean, 
  score: number, 
  isReady: boolean | undefined, 
  isWaiting: boolean, 
  index: number 
}) => {
  if (!player) {
    return (
      <div className="flex-1 max-w-[280px] h-24 rounded-2xl border border-dashed border-white/5 flex items-center justify-center opacity-20">
        <span className="text-[10px] font-black tracking-widest">P{index} WAITING...</span>
      </div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: index === 1 ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex-1 max-w-[320px]"
    >
      <div className={`relative arcade-panel p-4 rounded-2xl border transition-all overflow-hidden bg-black/40 backdrop-blur-xl ${
        isMe ? 'border-primary shadow-[0_0_30px_rgba(var(--primary-rgb),0.2)]' : 'border-white/5'
      }`}>
        {/* CRT Scanline Overlay */}
        <div className="absolute inset-0 pointer-events-none z-10" 
             style={{ background: 'linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.1) 50%), linear-gradient(90deg, rgba(255,0,0,0.02), rgba(0,255,0,0.01), rgba(0,0,255,0.02))', backgroundSize: '100% 2px, 3px 100%' }} />

        <div className="flex justify-between items-start relative z-20">
          <div className="flex flex-col gap-0.5">
            <div className={`text-[9px] font-black tracking-[0.2em] mb-1 uppercase`}
                 style={{ color: isMe ? 'var(--primary)' : 'rgba(255,255,255,0.4)' }}>
              {index === 1 ? '1UP' : '2UP'}{isMe && ' (YOU)'}
            </div>
            <div className="text-sm font-black uppercase tracking-tight truncate max-w-[120px] text-white">
              {player.name || "ANONYMOUS"}
            </div>
          </div>

          <div className="flex flex-col items-end">
            <div className="text-[8px] font-black tracking-widest uppercase mb-1" style={{ color: 'rgba(255,255,255,0.2)' }}>SCORE</div>
            <span className={`text-3xl font-black leading-none arcade-font tracking-tighter`}
                  style={{ color: isMe ? 'var(--primary)' : 'white' }}>
              {score.toString().padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Status bar */}
        <div className="mt-3 flex items-center justify-between relative z-20">
          <div className="flex gap-1 h-1 w-20 bg-white/5 rounded-full overflow-hidden">
             <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(score * 10, 100)}%` }}
              className="h-full"
              style={{ backgroundColor: isMe ? 'var(--primary)' : 'rgba(255,255,255,0.4)' }}
             />
          </div>
          
          {isWaiting && (
            <div className={`flex items-center gap-1.5 text-[8px] font-black uppercase ${!isReady ? 'animate-pulse' : ''}`}
                 style={{ color: isReady ? '#4ade80' : '#fb923c' }}>
              {isReady ? 'READY' : 'WAITING'}
            </div>
          )}
        </div>

        {/* Corner Decorations */}
        <div className={`absolute top-0 right-0 w-8 h-8 opacity-10 pointer-events-none -mr-4 -mt-4 rotate-45`}
             style={{ backgroundColor: isMe ? 'var(--primary)' : 'white' }} />
      </div>
    </motion.div>
  );
};
