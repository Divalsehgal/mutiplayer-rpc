import { motion } from 'framer-motion';
import { RoomState, Participant } from '../../types';

interface GameHeaderProps {
  room: RoomState | null | undefined;
  playerUid: string;
  player: Participant | undefined;
  opponent: Participant | undefined;
  isSpectator?: boolean;
}

export function GameHeader({ room, player, opponent, isSpectator }: GameHeaderProps) {
  if (!room || !room.gameState) return null;
  const gameState = room.gameState as any;

  return (
    <div className="flex justify-between items-center w-full px-8 py-6 bg-black/60 backdrop-blur-3xl border border-white/5 rounded-2xl mb-8 shadow-2xl relative overflow-hidden group">
      {/* HUD Scanner Effect */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>
        <div className="w-full h-1 bg-primary/20 absolute top-0 left-0 animate-[scan_3s_linear_infinite]"></div>
      </div>

      {isSpectator && (
        <div className="absolute top-0 left-0 w-full h-[2px] bg-accent shadow-[0_0_15px_rgba(6,182,212,0.8)] z-10"></div>
      )}
      
      {/* Player 1 Slot */}
      <div className="flex flex-col items-start justify-center z-10">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
          <span className="text-[10px] uppercase font-black text-white/40 tracking-[0.2em]">
             {player?.name || "Combatant A"} {!isSpectator && <span className="text-primary/60">[YOU]</span>}
          </span>
        </div>
        <motion.span key={(player as any)?.score} initial={{ scale: 1.2, color: '#06b6d4' }} animate={{ scale: 1, color: '#fff' }} className="text-5xl font-black text-white tracking-tighter">
          {(player as any)?.score || 0}
        </motion.span>
      </div>
      
      {/* Central HUD Info */}
      <div className="flex flex-col items-center z-10">
        <div className="flex items-center gap-3 mb-2">
           {isSpectator && (
             <span className="text-[9px] bg-accent/20 text-accent px-2 py-0.5 rounded border border-accent/30 font-black uppercase tracking-widest flex items-center gap-1.5">
               <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
               Live Feed
             </span>
           )}
           <span className="text-[9px] uppercase font-black text-white/30 tracking-[0.2em] bg-white/5 py-1 px-3 border border-white/5 rounded-sm">
             Cycle {gameState.roundCount || 1}
           </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-2xl font-black tracking-[0.3em] text-white brightness-125">{room.status.toUpperCase()}</span>
          {gameState.timer !== undefined && gameState.timer > 0 && (
            <div className="flex items-center gap-2 mt-1">
               <div className="h-[1px] w-4 bg-accent/40"></div>
               <span className="text-xs font-mono font-bold text-accent tabular-nums">{gameState.timer}s</span>
               <div className="h-[1px] w-4 bg-accent/40"></div>
            </div>
          )}
        </div>
      </div>
      
      {/* Player 2 Slot */}
      {opponent ? (
        <div className="flex flex-col items-end justify-center z-10 text-right">
          <div className="flex items-center gap-2 mb-1 justify-end">
            <span className="text-[10px] uppercase font-black text-white/40 tracking-[0.2em]">{opponent.name}</span>
            <div className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse"></div>
          </div>
          <motion.span key={(opponent as any)?.score} initial={{ scale: 1.2, color: '#ef4444' }} animate={{ scale: 1, color: '#ecf0f1' }} className="text-5xl font-black text-white/80 tracking-tighter">
            {(opponent as any)?.score || 0}
          </motion.span>
        </div>
      ) : (
        <div className="flex flex-col items-end opacity-20 z-10">
          <span className="text-[10px] font-black text-white uppercase tracking-widest mb-1">UNASSIGNED</span>
          <div className="text-3xl font-black text-white">--</div>
        </div>
      )}
    </div>
  );
}
