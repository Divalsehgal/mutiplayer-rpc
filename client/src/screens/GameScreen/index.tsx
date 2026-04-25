import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useGameLogic } from '../../hooks/useGameLogic';

// Components
import { InactivityWarning } from '../../components/InactivityWarning';
import { GameHeader } from '../../components/GameHeader';
import { RPSArena } from '../../components/RPSArena';
import { SnakeLadderArena } from '../../components/SnakeLadderArena';
import { TicTacToeArena } from '../../components/TicTacToeArena';

const ARENA_COMPONENTS: Record<string, any> = {
  'RPS': RPSArena,
  'SNAKE_LADDER': SnakeLadderArena,
  'TIC_TAC_TOE': TicTacToeArena,
};

export default function GameScreen() {
  const { id: roomId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    room,
    playerUid,
    ttlWarning,
    handleExtendSession,
    handleLeave,
    handleRPSMove,
    handleSnakeLadderMove,
    handleTicTacToeMove,
    handleNextRound
  } = useGameLogic(roomId);

  // Auto-navigate back to lobby if match is interrupted
  useEffect(() => {
    if (room?.status === 'waiting-for-players' && roomId) {
      navigate(`/room/${roomId}`);
    }
  }, [room?.status, roomId, navigate]);

  if (room === null) return (
    <div className="flex h-screen flex-col items-center justify-center p-6 text-center">
      <div className="bg-blob blob-1"></div>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="z-10 flex flex-col items-center">
        <div className="text-8xl mb-6">🏜️</div>
        <h2 className="text-4xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-destructive to-destructive/50 uppercase tracking-tighter">Match Abandoned</h2>
        <p className="text-muted-foreground mb-8 max-w-sm font-medium tracking-wide">The arena has been decommissioned or the code was invalid. All data has been purged.</p>
        <Button variant="glow" onClick={() => navigate('/')} className="px-12 font-black uppercase tracking-widest h-14">Return to Nexus</Button>
      </motion.div>
    </div>
  );

  if (!room || !room.gameState) return (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );

  const gameState = room.gameState as any;
  const isRPS = room.gameType === 'RPS';
  const isSnakeLadder = room.gameType === 'SNAKE_LADDER';
  
  const player = room.players.find(p => p.playerUid === playerUid);
  const opponent = room.players.find(p => p.playerUid !== playerUid && p.role === 'player');
  const isSpectator = player?.role === "spectator";
  const isPlayer = player?.role === "player";
  
  // If spectator, we watch first two players. If player, we watch ourselves + opponent.
  const playersInRoom = room.players.filter(p => p.role === 'player');
  const watchPlayer1 = isSpectator ? playersInRoom[0] : player;
  const watchPlayer2 = isSpectator ? playersInRoom[1] : opponent;
  
  const isRoundOver = gameState.status === 'waiting_for_ready';
  const amIReady = gameState.readyPlayers?.includes(playerUid);
  const winner = gameState.winner;

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-6 bg-black overflow-hidden">
      {/* Cinematic HUD Background */}
      <div className="absolute inset-0 z-0 opacity-20">
        <img src="/assets/general_hud_bg.png" className="w-full h-full object-cover" alt="bg" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/80"></div>
      </div>

      <InactivityWarning ttlWarning={ttlWarning} onExtend={handleExtendSession} />

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-4xl z-20">
        <GameHeader room={room} playerUid={playerUid} player={watchPlayer1} opponent={watchPlayer2} isSpectator={isSpectator} />

        <div className="grid grid-cols-1 gap-8">
           <Card className="border-white/5 bg-black/40 backdrop-blur-3xl overflow-hidden relative group">
             {/* HUD Corner Accents */}
             <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-primary/40"></div>
             <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-primary/40"></div>
             <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-primary/40"></div>
             <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-primary/40"></div>
             
             <CardContent className="p-12 flex flex-col items-center w-full min-h-[400px] justify-center relative">
                {ARENA_COMPONENTS[room.gameType] ? (
                  React.createElement(ARENA_COMPONENTS[room.gameType], {
                    room,
                    gameState,
                    playerUid: watchPlayer1?.playerUid || playerUid,
                    opponent: watchPlayer2,
                    isPlayer: isPlayer && !isSpectator,
                    isRoundOver,
                    handleRPSMove,
                    handleSnakeLadderMove,
                    handleTicTacToeMove,
                    handleNextRound,
                  })
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border border-white/10 rounded-full flex items-center justify-center animate-pulse">
                      <span className="text-2xl text-white/20">?</span>
                    </div>
                    <h1 className="text-xl text-muted-foreground uppercase font-black tracking-[0.3em]">
                      Architecture Pending
                    </h1>
                  </div>
                )}
             </CardContent>
           </Card>

           <AnimatePresence>
            {(isRoundOver || (isSnakeLadder && !!winner)) && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex justify-center flex-col items-center gap-6 py-8">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] text-accent mb-2">Protocol Concluded</span>
                  <h2 className="text-6xl font-black uppercase text-white tracking-[0.1em] drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                     {isRPS 
                        ? (gameState.lastResult?.winnerUid === playerUid ? "MISSION SUCCESS" : gameState.lastResult?.winnerUid ? "MISSION FAILED" : "STALEMATE")
                        : (winner === playerUid ? "ELITE RANK" : "CRITICAL LOSS")
                     }
                  </h2>
                </div>
                
                {isPlayer && isRPS && (
                   <Button variant="glow" size="lg" className="px-16 h-16 font-black text-xl tracking-widest shadow-[0_0_30px_rgba(6,182,212,0.2)]" disabled={amIReady} onClick={handleNextRound}>
                     {amIReady ? "INITIALIZING..." : "READY NEXT CYCLE"}
                   </Button>
                )}
                
                {isPlayer && isSnakeLadder && !!winner && (
                   <Button variant="glow" size="lg" className="px-16 h-16 font-black text-xl tracking-widest" onClick={handleLeave}>
                     RETURN TO BASE
                   </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="flex justify-center mt-12">
          <Button variant="outline" size="sm" className="font-black tracking-[0.3em] text-[10px] uppercase opacity-30 hover:opacity-100 hover:text-destructive border-transparent hover:border-destructive/20 transition-all px-8 py-6 h-auto" onClick={handleLeave}>
            [ DISCONNECT FROM ARENA ]
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
