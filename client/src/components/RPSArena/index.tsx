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
    <div className="w-full flex flex-col gap-8 relative">
      <AnimatePresence>
        {isRoundOver && (
          <motion.div 
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
            className="absolute inset-[-48px] z-50 flex flex-col items-center justify-center bg-black/60 rounded-3xl border border-white/10"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="flex flex-col items-center text-center p-8"
            >
              <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center border-2 border-primary/40 mb-6 animate-pulse">
                <span className="text-5xl">{isDraw ? '🤝' : '🏆'}</span>
              </div>
              <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">
                {isDraw ? 'Sync Protocol' : 'Combat Results'}
              </h2>
              <p className="text-primary text-xl font-black mb-8 uppercase tracking-[0.2em]">
                {isDraw ? "RESULT: EQUALIZED" : (room.players.find((p:any) => p.playerUid === winner)?.name + " DOMINANT")}
              </p>
              
              {isPlayer ? (
                <div className="flex flex-col gap-4 w-full min-w-[240px]">
                  <Button 
                    variant={amIReady ? "outline" : "glow"} 
                    size="lg" 
                    onClick={handleNextRound}
                    disabled={amIReady}
                    className="h-16 text-lg font-black uppercase tracking-widest"
                  >
                    {amIReady ? "WAITING FOR OPPONENT..." : "INITIALIZE NEXT ROUND"}
                  </Button>
                  <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
                    SYNCING: {readyPlayers.length}/{room.players.filter((p:any) => p.role === 'player').length} READY
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground font-bold uppercase tracking-widest animate-pulse">
                  Waiting for combatants to initialize next round...
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full flex justify-between items-center gap-4">
        <div className="flex-1 flex flex-col items-center text-center p-6 bg-white/5 rounded-2xl border border-white/5 group-hover:border-primary/20 transition-all">
          <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-6">
            {isPlayer ? "ALPHA PROTOCOL" : "COMBATANT ALPHA"}
          </span>
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-8xl mb-8 drop-shadow-2xl">
            {myMove === 'Rock' ? '🪨' : myMove === 'Paper' ? '📄' : myMove === 'Scissors' ? '✂️' : (myMove === 'hidden' ? '🔒' : '❓')}
          </motion.div>
          {isPlayer && !isRoundOver && (
            <div className="flex gap-4 w-full justify-center">
              <Button variant={myMove === 'Rock' ? "glow" : "outline"} disabled={!!myMove} onClick={() => handleRPSMove?.('Rock')} className="w-16 h-16 text-2xl">🪨</Button>
              <Button variant={myMove === 'Paper' ? "glow" : "outline"} disabled={!!myMove} onClick={() => handleRPSMove?.('Paper')} className="w-16 h-16 text-2xl">📄</Button>
              <Button variant={myMove === 'Scissors' ? "glow" : "outline"} disabled={!!myMove} onClick={() => handleRPSMove?.('Scissors')} className="w-16 h-16 text-2xl">✂️</Button>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-2">
           <div className="h-12 w-[1px] bg-gradient-to-t from-white/10 to-transparent"></div>
           <div className="text-3xl font-black text-white/10 py-2 italic tracking-tighter">VS</div>
           <div className="h-12 w-[1px] bg-gradient-to-b from-white/10 to-transparent"></div>
        </div>

        <div className="flex-1 flex flex-col items-center text-center p-6 bg-white/5 rounded-2xl border border-white/5 group-hover:border-destructive/20 transition-all">
          <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-6">
            {opponent?.name?.toUpperCase() || "COMBATANT BRAVO"}
          </span>
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-8xl mb-8 opacity-90 drop-shadow-2xl">
            {isRoundOver 
              ? (opponentMove === 'Rock' ? '🪨' : opponentMove === 'Paper' ? '📄' : opponentMove === 'Scissors' ? '✂️' : '❓') 
              : (opponentMove === 'hidden' || opponentMove ? '🔒' : '❓')}
          </motion.div>
          {!isRoundOver && (
            <div className={`px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${opponentMove ? 'bg-destructive/20 border-destructive/40 text-destructive-foreground animate-pulse' : 'bg-white/5 border-white/10 text-white/30'}`}>
              {opponentMove ? "STRIKE READY" : "CALCULATING"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
