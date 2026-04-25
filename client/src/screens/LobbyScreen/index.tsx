import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { socket, getPlayerUid } from '../../api/socket';

const MIN_NAME_LENGTH = 2;
const ACTIVE_OPACITY = 1;
const INACTIVE_OPACITY = 0.3;

export default function LobbyScreen() {
  const [roomId, setRoomId] = useState('');
  const [playerName, setPlayerName] = useState(sessionStorage.getItem('playerName') || '');
  const [gameType, setGameType] = useState('RPS');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreateRoom = () => {
    if (!playerName.trim()) return alert("Enter a player name");
    sessionStorage.setItem('playerName', playerName);
    setLoading(true);
    
    // Must register before creating room
    socket.emit('register', { playerUid: getPlayerUid(), name: playerName }, () => {
      socket.emit('create-room', { hostName: playerName, gameType }, (res: { ok: boolean, roomId?: string, error?: string }) => {
        setLoading(false);
        if (res.ok && res.roomId) {
          navigate(`/room/${res.roomId}`);
        } else {
          alert(res.error || "Failed to create room");
        }
      });
    });
  };

  const handleJoinRoom = () => {
    if (!roomId.trim() || !playerName.trim()) return alert("Enter Room ID and Player Name");
    sessionStorage.setItem('playerName', playerName);
    navigate(`/room/${roomId}`);
  };

  return (
    <div className="relative flex h-screen w-full items-center justify-center p-4">
      {/* Dynamic Ambient Backgrounds */}
      <div className="bg-blob blob-1"></div>
      <div className="bg-blob blob-2"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-lg z-10"
      >
        <Card className="w-full border-t-2 border-t-primary/30 overflow-hidden">
          <CardHeader className="text-center">
            <CardTitle className="text-5xl mb-2 font-black tracking-tighter">Dice & Draws</CardTitle>
            <p className="text-muted-foreground/70 font-medium tracking-[0.3em] text-[10px] uppercase">Multiplayer Arena</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Identity Section (Primary Gate) */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">Alias</label>
              <Input 
                placeholder="ENTER YOUR ALIAS..." 
                value={playerName} 
                onChange={(e) => setPlayerName(e.target.value)} 
                className="text-lg placeholder:text-muted-foreground/20 focus:border-primary/50 text-center uppercase font-bold h-14"
              />
            </div>

            <motion.div
              animate={{ 
                opacity: playerName.trim().length >= MIN_NAME_LENGTH ? ACTIVE_OPACITY : INACTIVE_OPACITY,
                pointerEvents: playerName.trim().length >= MIN_NAME_LENGTH ? 'auto' : 'none',
                filter: playerName.trim().length >= MIN_NAME_LENGTH ? 'blur(0px)' : 'blur(2px)'
              }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Conditional Join Section */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">Join</label>
                <div className="flex gap-3">
                  <Input 
                    placeholder="ROOM CODE" 
                    value={roomId} 
                    onChange={(e) => setRoomId(e.target.value.toUpperCase())} 
                    className="font-mono text-center tracking-[0.3em] font-bold text-xl uppercase h-14"
                    maxLength={6}
                  />
                  <Button variant="outline" size="lg" onClick={handleJoinRoom} className="w-28 uppercase font-bold h-14">
                    Join
                  </Button>
                </div>
              </div>

              {/* Create Section - Hidden if RoomCode is being entered */}
              <motion.div
                animate={{ 
                  height: roomId.length === 0 ? 'auto' : 0,
                  opacity: roomId.length === 0 ? 1 : 0,
                  margin: roomId.length === 0 ? '1.5rem 0' : 0
                }}
                className="overflow-hidden space-y-6"
              >

                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">Rounds</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'RPS', label: 'RPS' },
                      { id: 'SNAKE_LADDER', label: 'SNAKES' },
                      { id: 'TIC_TAC_TOE', label: 'TTT' }
                    ].map((game) => (
                      <Button 
                        key={game.id}
                        variant={gameType === game.id ? 'glow' : 'outline'} 
                        className="tracking-widest text-[10px] h-14 font-black" 
                        onClick={() => setGameType(game.id)}
                      >{game.label}</Button>
                    ))}
                  </div>
                </div>

                <Button variant="glow" size="lg" className="w-full h-16 text-xl tracking-widest uppercase font-black" disabled={loading} onClick={handleCreateRoom}>
                  {loading ? "INITIALIZING..." : "Create Match"}
                </Button>
              </motion.div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
