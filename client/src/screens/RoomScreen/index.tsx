import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useRoomLogic } from '../../hooks/useRoomLogic';
import { InactivityWarning } from '../../components/InactivityWarning';

const MIN_PLAYERS_TO_START = 2;
const LOBBY_BG = "/assets/lobby_bg.png";

export default function RoomScreen() {
  const { id: roomId } = useParams<{ id: string }>();
  const {
    room,
    playerUid,
    ttlWarning,
    handleStartGame,
    handleExtendSession,
    handleLeave
  } = useRoomLogic(roomId);
  const navigate = useNavigate();

  if (room === null) return (
    <div className="flex h-screen flex-col items-center justify-center p-6 text-center bg-black overflow-hidden relative">
       <div className="absolute inset-0 z-0 opacity-20 grayscale brightness-50">
        <img src={LOBBY_BG} className="w-full h-full object-cover" alt="bg" />
      </div>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="z-10 flex flex-col items-center">
        <div className="text-8xl mb-6">🏚️</div>
        <h2 className="text-4xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-destructive to-destructive/50 uppercase tracking-tighter">Lobby Expired</h2>
        <p className="text-muted-foreground mb-8 max-w-sm font-medium tracking-wide">This staging area has been abandoned. All combat assets have been purged.</p>
        <Button variant="glow" onClick={() => navigate('/')} className="px-12 font-black uppercase tracking-widest h-14">Back to Dice & Draws</Button>
      </motion.div>
    </div>
  );

  if (!room) return (
    <div className="flex h-screen items-center justify-center bg-black">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary shadow-[0_0_15px_rgba(6,182,212,0.5)]"></div>
    </div>
  );

  const players = room.players.filter(p => p.role === 'player');
  const spectators = room.players.filter(p => p.role === 'spectator');
  const host = room.players[0];
  const isHost = host?.playerUid === playerUid;
  const myPlayer = room.players.find(p => p.playerUid === playerUid);
  const isSpectator = myPlayer?.role === "spectator";

  if (room.status === "playing") {
    return (
      <div className="flex h-screen flex-col items-center justify-center space-y-4 bg-black overflow-hidden relative">
        <div className="absolute inset-0 z-0 opacity-10">
          <img src="/Users/divalsehgal/.gemini/antigravity/brain/a5dba4d7-b664-4d99-a526-45903828c663/game_lobby_background_1777119464439.png" className="w-full h-full object-cover" alt="bg" />
        </div>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center z-10">
          <h2 className="text-4xl font-black mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent uppercase tracking-tighter">Match Initializing</h2>
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-8 shadow-[0_0_20px_rgba(6,182,212,0.4)]"></div>
          <p className="text-muted-foreground animate-pulse font-bold tracking-widest text-[10px] uppercase">Calibrating Arena Sync...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-6 bg-black overflow-hidden">
      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0 opacity-40">
        <img src="/Users/divalsehgal/.gemini/antigravity/brain/a5dba4d7-b664-4d99-a526-45903828c663/game_lobby_background_1777119464439.png" className="w-full h-full object-cover blur-[2px]" alt="bg" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/80 to-black"></div>
      </div>

      <InactivityWarning ttlWarning={ttlWarning} onExtend={handleExtendSession} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-5xl z-10 flex flex-col gap-8">
        
        {/* Header HUD */}
        <div className="flex justify-between items-end px-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-accent text-[10px] font-black uppercase tracking-[0.3em]">{room.gameType.replace('_', ' ')} ARCHITECTURE</span>
              <Badge variant="outline" className="text-[8px] border-accent/20 text-accent/60 uppercase tracking-widest px-2 py-0">
                {room.maxPlayers} Combatants Max
              </Badge>
            </div>
            <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">PRE-MATCH LOBBY</h1>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mb-1">ROOM ID</span>
            <span className="text-xl font-mono font-bold text-white/40 tracking-[0.2em]">{room.id}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* COMBATANTS SECTION */}
          <div className="md:col-span-8 flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/10"></div>
              <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">Active Combatants</span>
              <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/10"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
              {Array.from({ length: room.maxPlayers }).map((_, idx) => {
                const p = players[idx];
                const emoji = idx === 0 ? '👑' : (idx === 1 ? '🔥' : (idx === 2 ? '⚡' : '🌈'));
                return (
                  <Card key={idx} className={`relative overflow-hidden border-2 transition-all duration-500 bg-black/40 backdrop-blur-3xl ${p ? (p.playerUid === playerUid ? 'border-primary/50 shadow-[0_0_30px_rgba(6,182,212,0.1)]' : 'border-white/5') : 'border-dashed border-white/5 opacity-40'}`}>
                    {p && (
                      <div className="absolute top-0 right-0 p-2">
                        <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${p.status === 'online' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {p.status}
                        </div>
                      </div>
                    )}
                    <CardContent className="p-8 flex flex-col items-center">
                      <div className={`w-24 h-24 rounded-full mb-6 border-2 flex items-center justify-center text-4xl shadow-inner ${p ? 'bg-white/5 border-white/10' : 'bg-transparent border-white/5 animate-pulse'}`}>
                        {p ? emoji : '❓'}
                      </div>
                      <div className="text-center">
                        <h3 className="text-xl font-bold text-white uppercase tracking-tight truncate max-w-[150px]">
                          {p ? p.name : "Waiting..."}
                        </h3>
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mt-1">
                          {idx === 0 ? "HOST / PLAYER 1" : `PLAYER ${idx + 1}`}
                        </p>
                      </div>
                      {p?.playerUid === playerUid && (
                         <div className="mt-4 px-3 py-1 rounded-full bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest">
                           Identified
                         </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="flex flex-col items-center gap-4 mt-4">
              {isHost ? (
                <Button variant="glow" size="lg" className="w-full h-16 text-xl font-black tracking-[0.2em] shadow-2xl"
                  disabled={players.length < MIN_PLAYERS_TO_START} onClick={handleStartGame}>
                  INITIALIZE MATCH
                </Button>
              ) : isSpectator ? (
                <div className="w-full p-6 border border-accent/20 bg-accent/5 rounded-xl text-center">
                  <span className="text-accent text-[10px] font-black uppercase tracking-[0.3em]">YOU ARE SPECTATING</span>
                  <p className="text-muted-foreground text-xs font-medium mt-2">Promoting to active slot if a combatant drops.</p>
                </div>
              ) : (
                <div className="w-full flex flex-col items-center gap-4 p-8 bg-white/5 rounded-2xl border border-white/5">
                   <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                   <span className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em]">Awaiting Host Override</span>
                </div>
              )}
            </div>
          </div>

          {/* SIDEBAR: SPECTATORS & DETAILS */}
          <div className="md:col-span-4 flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">Spectator Deck</span>
              <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/10"></div>
            </div>

            <Card className="bg-black/20 backdrop-blur-md border-white/5">
              <CardContent className="p-4 flex flex-col gap-2 min-h-[150px]">
                {spectators.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground text-[10px] font-bold uppercase tracking-widest opacity-20">
                    Deck Empty
                  </div>
                ) : (
                  spectators.map((s) => (
                    <div key={s.playerUid} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                      <span className="text-xs font-bold text-white/60">{s.name} {s.playerUid === playerUid && "(You)"}</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-accent/50"></div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <div className="mt-auto flex flex-col gap-4">
               <Button variant="outline" size="sm" onClick={handleLeave}
                className="w-full font-black uppercase tracking-[0.2em] text-[10px] h-12 opacity-40 hover:opacity-100 hover:text-destructive border-white/10 hover:border-destructive/30 transition-all"
              >
                Retreat from Arena
              </Button>
              <div className="text-center px-4">
                <p className="text-[9px] text-muted-foreground leading-relaxed uppercase font-medium tracking-tighter">System Version 3.4.0 • Region: Local-Edge • Stable</p>
              </div>
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
