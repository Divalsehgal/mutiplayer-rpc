import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { BaseArenaProps, TicTacToeState } from '../../types';

export function TicTacToeArena({ 
  room, 
  gameState, 
  playerUid, 
  isPlayer, 
  handleTicTacToeMove, 
  handleNextRound 
}: BaseArenaProps) {
  const state = gameState as TicTacToeState;
  const { board = Array(9).fill(null), currentTurn, winner, readyPlayers = [], isDraw } = state;
  const isMyTurn = currentTurn === playerUid;
  const amIReady = readyPlayers.includes(playerUid);
  
  if (!board) {
    console.error("TicTacToe Error: Board is missing from gameState", gameState);
  }

  const handleCellClick = (i: number) => {
    if (board[i] || !isMyTurn || !isPlayer || winner) {
      console.warn("TicTacToe: Move rejected locally", { 
        alreadyMarked: !!board[i], 
        isMyTurn, 
        isPlayer, 
        hasWinner: !!winner 
      });
      return;
    }
    console.log("TicTacToe: Emitting move", i);
    handleTicTacToeMove?.(i);
  };
  
  const players = room.players.filter(p => p.role === 'player');

  return (
    <div className="w-full flex flex-col items-center gap-6 sm:gap-8 relative">
      <AnimatePresence>
        {(winner || isDraw) && (
          <motion.div 
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
            className="absolute inset-[-16px] sm:inset-[-48px] z-50 flex flex-col items-center justify-center bg-black/80 rounded-3xl border border-white/10"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="flex flex-col items-center text-center p-4 sm:p-8"
            >
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-primary/20 rounded-full flex items-center justify-center border-2 border-primary/40 mb-4 sm:mb-6 animate-pulse">
                <span className="text-3xl sm:text-5xl">{isDraw ? '🤝' : '🏁'}</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tighter mb-1 sm:mb-2">
                {isDraw ? 'Deadlock Reached' : 'Grid Dominance'}
              </h2>
              <p className="text-primary text-sm sm:text-xl font-black mb-6 sm:mb-8 uppercase tracking-[0.2em]">
                {isDraw ? "ARENA SYNC: EQUALIZED" : (room.players.find(p => p.playerUid === winner)?.name + " ASCENDED")}
              </p>
              
              {isPlayer ? (
                <div className="flex flex-col gap-3 w-full min-w-[200px] sm:min-w-[240px]">
                  <Button 
                    variant={amIReady ? "outline" : "glow"} 
                    size="lg" 
                    onClick={handleNextRound}
                    disabled={amIReady}
                    className="h-14 sm:h-16 text-sm sm:text-lg font-black uppercase tracking-widest"
                  >
                    {amIReady ? "WAITING..." : "NEXT CYCLE"}
                  </Button>
                  <p className="text-[9px] sm:text-[10px] text-white/30 font-bold uppercase tracking-widest">
                    SYNCING: {readyPlayers.length}/{players.length} READY
                  </p>
                </div>
              ) : (
                <p className="text-[10px] sm:text-xs text-muted-foreground font-bold uppercase tracking-widest animate-pulse">
                  Waiting for next cycle...
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full max-w-[280px] sm:max-w-[360px] aspect-square relative p-1.5 sm:p-2 bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
        {/* HUD Scanner overlay for the grid */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-5">
           <div className="absolute inset-0 bg-[length:15px_15px] sm:bg-[length:20px_20px] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)]"></div>
        </div>

        {(board || []).map((cell: string | null, i: number) => (
          <motion.div
            key={i}
            whileHover={!cell && isMyTurn && !winner ? { scale: 0.95, backgroundColor: "rgba(255,255,255,0.05)" } : {}}
            whileTap={!cell && isMyTurn && !winner ? { scale: 0.9 } : {}}
            onClick={() => handleCellClick(i)}
            className={`
              relative flex items-center justify-center text-3xl sm:text-5xl font-black rounded-lg sm:rounded-xl border border-white/5 transition-all
              ${!cell && isMyTurn && isPlayer && !winner ? 'cursor-pointer hover:border-primary/40' : 'cursor-default'}
              ${cell === 'X' ? 'text-primary' : 'text-destructive'}
              ${winner && board.some((_, idx) => i === idx) ? 'bg-white/[0.02]' : ''}
            `}
          >
            <AnimatePresence mode="wait">
              {cell && (
                <motion.span
                  initial={{ scale: 0, rotate: -45, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  className="drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                >
                  {cell}
                </motion.span>
              )}
            </AnimatePresence>
            
            {/* Cell Coordinate HUD */}
            <span className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 text-[6px] sm:text-[8px] font-mono text-white/10 uppercase font-bold">
               N-0{i}
            </span>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center gap-4 w-full max-w-[280px] sm:max-w-[360px]">
         <div className={`flex-1 p-3 sm:p-4 rounded-xl border transition-all ${isMyTurn && !winner ? 'bg-primary/10 border-primary/40 shadow-[0_0_20px_rgba(6,182,212,0.1)]' : 'bg-white/5 border-white/5'}`}>
            <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest block mb-0.5 sm:mb-1 text-white/30">Current Turn</span>
            <span className={`text-xs sm:text-sm font-black uppercase tracking-widest ${isMyTurn ? 'text-primary' : 'text-white/60'}`}>
               {isMyTurn ? "YOUR MOVE" : (room.players.find(p => p.playerUid === currentTurn)?.name || "WAITING")}
            </span>
         </div>
      </div>
    </div>
  );
}
