import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { BaseArenaProps, RPSState } from '../../types';

export function RPSArena({ 
  room, 
  gameState, 
  playerUid, 
  opponent, 
  isPlayer, 
  isRoundOver, 
  handleRPSMove, 
  handleNextRound 
}: BaseArenaProps) {
  const state = gameState as RPSState;
  const myMove = state.playerChoices?.[playerUid];
  const opponentMove = opponent ? state.playerChoices?.[opponent.playerUid] : null;
  const readyPlayers = state.readyPlayers || [];
  const amIReady = readyPlayers.includes(playerUid);
  const winner = state.lastResult?.winnerUid;
  const isDraw = state.lastResult?.isDraw;

  return (
    <div className="w-full flex flex-col gap-6 sm:gap-8 relative">
      <AnimatePresence>
        {isRoundOver && (
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
                <span className="text-3xl sm:text-5xl">{isDraw ? '🤝' : '🏆'}</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tighter mb-1 sm:mb-2">
                {isDraw ? 'Sync Protocol' : 'Combat Results'}
              </h2>
              <p className="text-primary text-sm sm:text-xl font-black mb-6 sm:mb-8 uppercase tracking-widest">
                {isDraw ? "RESULT: EQUALIZED" : (room.players.find((p) => p.playerUid === winner)?.name + " DOMINANT")}
              </p>
              
              {isPlayer ? (
                <div className="flex flex-col gap-3 w-full min-w-52 sm:min-w-64">
                  <Button 
                    variant={amIReady ? "outline" : "glow"} 
                    size="lg" 
                    onClick={handleNextRound}
                    disabled={amIReady}
                    className="h-14 sm:h-16 text-sm sm:text-lg font-black uppercase tracking-widest"
                  >
                    {amIReady ? "WAITING..." : "NEXT ROUND"}
                  </Button>
                  <p className="text-xs text-white/30 font-bold uppercase tracking-widest">
                    SYNCING: {readyPlayers.length}/{room.players.filter((p) => p.role === 'player').length} READY
                  </p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest animate-pulse">
                  Waiting for next round...
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="w-full sm:flex-1 flex flex-col items-center text-center p-4 sm:p-6 bg-white/5 rounded-2xl border border-white/5 group-hover:border-primary/20 transition-all">
          <span className="text-xs font-black text-white/30 uppercase tracking-widest mb-4 sm:mb-6">
            {isPlayer ? "ALPHA PROTOCOL" : "COMBATANT ALPHA"}
          </span>
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-6xl sm:text-8xl mb-6 sm:mb-8 drop-shadow-2xl">
            {myMove === 'Rock' ? '🪨' : myMove === 'Paper' ? '📄' : myMove === 'Scissors' ? '✂️' : (myMove === 'hidden' ? '🔒' : '❓')}
          </motion.div>
          {isPlayer && !isRoundOver && (
            <div className="flex gap-2 sm:gap-4 w-full justify-center">
              <Button variant={myMove === 'Rock' ? "glow" : "outline"} disabled={!!myMove} onClick={() => handleRPSMove?.('Rock')} className="w-12 h-12 sm:w-16 sm:h-16 text-xl sm:text-2xl">🪨</Button>
              <Button variant={myMove === 'Paper' ? "glow" : "outline"} disabled={!!myMove} onClick={() => handleRPSMove?.('Paper')} className="w-12 h-12 sm:w-16 sm:h-16 text-xl sm:text-2xl">📄</Button>
              <Button variant={myMove === 'Scissors' ? "glow" : "outline"} disabled={!!myMove} onClick={() => handleRPSMove?.('Scissors')} className="w-12 h-12 sm:w-16 sm:h-16 text-xl sm:text-2xl">✂️</Button>
            </div>
          )}
        </div>

        <div className="flex flex-row sm:flex-col items-center gap-2">
           <div className="w-8 sm:w-px h-px sm:h-12 bg-gradient-to-r sm:bg-gradient-to-t from-white/10 to-transparent"></div>
           <div className="text-xl sm:text-3xl font-black text-white/10 py-1 sm:py-2 italic tracking-tighter">VS</div>
           <div className="w-8 sm:w-px h-px sm:h-12 bg-gradient-to-l sm:bg-gradient-to-b from-white/10 to-transparent"></div>
        </div>

        <div className="w-full sm:flex-1 flex flex-col items-center text-center p-4 sm:p-6 bg-white/5 rounded-2xl border border-white/5 group-hover:border-destructive/20 transition-all">
          <span className="text-xs font-black text-white/30 uppercase tracking-widest mb-4 sm:mb-6">
            {opponent?.name?.toUpperCase() || "COMBATANT BRAVO"}
          </span>
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-6xl sm:text-8xl mb-6 sm:mb-8 opacity-90 drop-shadow-2xl">
            {isRoundOver 
              ? (opponentMove === 'Rock' ? '🪨' : opponentMove === 'Paper' ? '📄' : opponentMove === 'Scissors' ? '✂️' : '❓') 
              : (opponentMove === 'hidden' || opponentMove ? '🔒' : '❓')}
          </motion.div>
          {!isRoundOver && (
            <div className={`px-3 py-1 rounded-full border text-xs font-black uppercase tracking-widest ${opponentMove ? 'bg-destructive/20 border-destructive/40 text-destructive animate-pulse' : 'bg-white/5 border-white/10 text-white/30'}`}>
              {opponentMove ? "STRIKE READY" : "CALCULATING"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
