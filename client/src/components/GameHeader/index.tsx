import { motion } from 'framer-motion';
import { RoomState, Participant, GameState, isPlayer, hasRoundCount } from '../../types';

interface GameHeaderProps {
  room: RoomState | null | undefined;
  playerUid: string;
  player: Participant | undefined;
  opponent: Participant | undefined;
  isSpectator?: boolean;
}

export function GameHeader({ room, player, opponent, isSpectator }: GameHeaderProps) {
  if (!room || !room.gameState) return null;
  const gameState = room.gameState as GameState;

  const player1Score = player && isPlayer(player) ? player.score : 0;
  const player2Score = opponent && isPlayer(opponent) ? opponent.score : 0;

  return (
    <div className="flex justify-between items-center w-full px-4 sm:px-8 py-4 sm:py-6 bg-black/60 backdrop-blur-3xl border border-white/5 rounded-2xl mb-4 sm:mb-8 shadow-2xl relative overflow-hidden group">
      {/* HUD Scanner Effect */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>
        <div className="w-full h-1 bg-primary/20 absolute top-0 left-0 animate-[scan_3s_linear_infinite]"></div>
      </div>

      {isSpectator && (
        <div className="absolute top-0 left-0 w-full h-[2px] bg-accent shadow-accent z-10"></div>
      )}
      
      {/* Player 1 Slot */}
      <div className="flex flex-col items-start justify-center z-10">
        <div className="flex items-center gap-1_5 mb-0_5 sm:mb-1">
          <div className="w-1 h-1 sm:w-1_5 sm:h-1_5 rounded-full bg-primary animate-pulse"></div>
          <span className="text-[8px] sm:text-xs uppercase font-black text-white/40 tracking-widest truncate max-w-[60px] sm:max-w-none">
             {player?.name || "A"} {!isSpectator && <span className="text-primary/60">[YOU]</span>}
          </span>
        </div>
        <motion.span key={player1Score} initial={{ scale: 1.2, color: 'var(--accent)' }} animate={{ scale: 1, color: 'var(--white)' }} className="text-2xl sm:text-5xl font-black text-white tracking-tighter text-glow-accent">
          {player1Score || 0}
        </motion.span>
      </div>
      
      {/* Central HUD Info */}
      <div className="flex flex-col items-center z-10 mx-2">
        <div className="flex items-center gap-1_5 sm:gap-3 mb-1 sm:mb-2">
           {isSpectator && (
             <span className="text-[7px] sm:text-[9px] bg-accent/20 text-accent px-1 sm:px-2 py-0_5 rounded border border-accent/30 font-black uppercase tracking-widest flex items-center gap-1 sm:gap-1_5">
               <span className="w-1 h-1 sm:w-1_5 sm:h-1_5 rounded-full bg-accent animate-pulse"></span>
               Live
             </span>
           )}
           <span className="text-[7px] sm:text-[9px] uppercase font-black text-white/30 tracking-widest bg-white/5 py-0_5 sm:py-1 px-1_5 sm:px-3 border border-white/5 rounded-sm">
             R{hasRoundCount(gameState) ? gameState.roundCount : 1}
           </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs sm:text-2xl font-black tracking-widest text-white brightness-125">{room.status === 'waiting-for-players' ? 'WAITING' : room.status.toUpperCase()}</span>
          {gameState.timer !== undefined && gameState.timer > 0 && (
            <div className="flex items-center gap-1 sm:gap-2 mt-0_5 sm:mt-1">
               <div className="h-px w-4 bg-accent/40"></div>
               <span className="text-[10px] sm:text-xs font-mono font-bold text-accent tabular-nums">{gameState.timer}s</span>
               <div className="h-px w-4 bg-accent/40"></div>
            </div>
          )}
        </div>
      </div>
      
      {/* Player 2 Slot */}
      {opponent ? (
        <div className="flex flex-col items-end justify-center z-10 text-right">
          <div className="flex items-center gap-1_5 mb-0_5 sm:mb-1 justify-end">
            <span className="text-[8px] sm:text-xs uppercase font-black text-white/40 tracking-widest truncate max-w-[60px] sm:max-w-none">{opponent.name}</span>
            <div className="w-1 h-1 sm:w-1_5 sm:h-1_5 rounded-full bg-destructive animate-pulse"></div>
          </div>
          <motion.span key={player2Score} initial={{ scale: 1.2, color: 'var(--destructive)' }} animate={{ scale: 1, color: 'var(--white)' }} className="text-2xl sm:text-5xl font-black text-white/80 tracking-tighter">
            {player2Score || 0}
          </motion.span>
        </div>
      ) : (
        <div className="flex flex-col items-end opacity-20 z-10">
          <span className="text-[8px] sm:text-xs font-black text-white uppercase tracking-widest mb-1">WAITING</span>
          <div className="text-xl sm:text-3xl font-black text-white">--</div>
        </div>
      )}
    </div>

  );
}
