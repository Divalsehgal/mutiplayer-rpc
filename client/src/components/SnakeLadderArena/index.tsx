import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { ParticipantBase, BaseArenaProps, SnakeLadderState } from '../../types';
import { SNAKE_LADDER_BOARD } from '../../constants/gameConstants';

export function SnakeLadderArena({ 
  room, 
  gameState, 
  playerUid, 
  isPlayer, 
  handleSnakeLadderMove, 
  handleNextRound 
}: BaseArenaProps) {
  const state = gameState as SnakeLadderState;
  const isMyTurn = state.currentTurn === playerUid;
  const positions = state.positions || {};
  const logs = state.logs || [];
  const winner = state.winner;
  const readyPlayers = state.readyPlayers || [];
  const amIReady = readyPlayers.includes(playerUid);

  return (
    <div className="w-full flex flex-col items-center gap-6 relative">
      <AnimatePresence>
        {winner && (
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
                <span className="text-5xl">🏆</span>
              </div>
              <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">Victory Protocol</h2>
              <p className="text-primary text-xl font-black mb-8 uppercase tracking-[0.2em]">
                {room.players.find(p => p.playerUid === winner)?.name || "COMBATANT"} ASCENDED
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
                    {amIReady ? "WAITING FOR OPPONENT..." : "REQUEST REMATCH"}
                  </Button>
                  <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
                    SYNCING: {readyPlayers.length}/{room.players.filter(p => p.role === 'player').length} READY
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground font-bold uppercase tracking-widest animate-pulse">
                  Waiting for combatants to initialize next cycle...
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Board */}
      <div className="grid grid-cols-10 gap-1 bg-white/5 p-2 rounded-xl border border-white/10 w-full aspect-square max-w-[500px] relative">
        {Array.from({ length: 100 }, (_, i) => {
          const cellNum = 100 - i;
          const row = Math.floor((cellNum - 1) / 10);
          const col = (cellNum - 1) % 10;
          const displayNum = row % 2 === 1 ? (row * 10) + (10 - col) : cellNum;
          
          const isLadderStart = SNAKE_LADDER_BOARD.ladders[displayNum];
          const isSnakeStart = SNAKE_LADDER_BOARD.snakes[displayNum];
          
          return (
            <div key={displayNum} className={`relative flex items-center justify-center text-[8px] font-bold rounded-sm aspect-square ${displayNum % 2 === 0 ? 'bg-white/5' : 'bg-white/10'}`}>
              <span className="opacity-20">{displayNum}</span>
              {isLadderStart && <span className="absolute inset-0 flex items-center justify-center text-lg opacity-40">🪜</span>}
              {isSnakeStart && <span className="absolute inset-0 flex items-center justify-center text-lg opacity-40">🐍</span>}
              
              <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-0.5 p-0.5">
                {room.players.filter((p: ParticipantBase) => positions[p.playerUid] === displayNum).map((p: ParticipantBase) => (
                  <motion.div 
                    key={p.playerUid}
                    layoutId={p.playerUid}
                    className={`w-3 h-3 rounded-full border border-white shadow-lg ${p.playerUid === playerUid ? 'bg-primary z-10' : 'bg-accent'}`}
                    title={p.name}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col items-center gap-4 w-full">
        <div className="flex items-center gap-8 bg-black/40 p-4 rounded-2xl border border-white/5 w-full justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Last Roll</span>
            <span className="text-3xl font-black text-primary">{state.lastRoll || '-'}</span>
          </div>
          
          {isPlayer && (
            <Button 
              variant="glow" 
              size="lg" 
              className="flex-1 max-w-[200px]" 
              disabled={!isMyTurn || !!winner}
              onClick={handleSnakeLadderMove}
            >
              {isMyTurn ? "🎲 ROLL DICE" : "WAITING..."}
            </Button>
          )}

          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Your Pos</span>
            <span className="text-3xl font-black text-accent">{positions[playerUid] || 1}</span>
          </div>
        </div>

        <div className="w-full bg-black/20 rounded-xl p-3 border border-white/5 max-h-[100px] overflow-y-auto">
          {logs.map((log: string, i: number) => (
            <div key={i} className="text-[10px] text-muted-foreground border-l-2 border-primary/30 pl-2 mb-1 last:mb-0 text-left">
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
