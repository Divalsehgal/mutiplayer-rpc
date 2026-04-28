import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { socket } from '../../api/socket';
import { useAuthStore } from '../../store/auth';
import { RoomState } from '../../types';
import { CreateRoomCard } from './components/CreateRoomCard';
import { PublicRoomsList } from './components/PublicRoomsList';

const MIN_NAME_LENGTH = 2;

export default function LobbyScreen() {
  const { user } = useAuthStore();
  const [roomId, setRoomId] = useState('');
  const [playerName, setPlayerName] = useState(user?.user_name || sessionStorage.getItem('playerName') || '');
  const [gameType, setGameType] = useState('RPS');
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [publicRooms, setPublicRooms] = useState<RoomState[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch public rooms on mount
    socket.emit('get-public-rooms', (res) => {
      if (res.ok) setPublicRooms(res.rooms);
    });

    // Refresh public rooms every 10 seconds
    const interval = setInterval(() => {
      socket.emit('get-public-rooms', (res) => {
        if (res.ok) setPublicRooms(res.rooms);
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleCreateRoom = () => {
    if (!playerName.trim() || playerName.length < MIN_NAME_LENGTH) {
        return alert(`Enter a player name (min ${MIN_NAME_LENGTH} chars)`);
    }
    
    setLoading(true);
    sessionStorage.setItem('playerName', playerName);

    socket.emit('create-room', { 
        hostName: playerName, 
        gameType,
        isPublic
    }, (res) => {
      setLoading(false);
      if (res.ok && res.roomId) {
        navigate(`/room/${res.roomId}`);
      } else {
        alert(res.error || "Failed to create room");
      }
    });
  };

  const handleJoinRoom = (targetId?: string) => {
    const idToJoin = targetId || roomId;
    if (!idToJoin.trim()) return alert("Enter a Room ID");
    if (!playerName.trim()) return alert("Enter your name first");

    setLoading(true);
    sessionStorage.setItem('playerName', playerName);
    
    socket.emit('join-room', { roomId: idToJoin, name: playerName }, (res) => {
      setLoading(false);
      if (res.ok) {
        navigate(`/room/${idToJoin}`);
      } else {
        alert(res.error || "Room not found");
      }
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-4 lg:p-8 h-full max-w-7xl mx-auto w-full">
      {/* LEFT COLUMN: Controls */}
      <div className="w-full lg:w-[400px] space-y-6 flex-shrink-0">
        <CreateRoomCard 
          playerName={playerName}
          setPlayerName={setPlayerName}
          gameType={gameType}
          setGameType={setGameType}
          isPublic={isPublic}
          setIsPublic={setIsPublic}
          handleCreateRoom={handleCreateRoom}
        />

        <Card className="bg-card/30 border-dashed border-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-black uppercase tracking-widest opacity-70">DIRECT ACCESS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input 
                placeholder="ROOM ID" 
                value={roomId} 
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                className="h-12 font-mono font-bold"
              />
              <Button 
                onClick={() => handleJoinRoom()} 
                disabled={loading}
                className="h-12 px-6 font-bold"
              >
                JOIN
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RIGHT COLUMN: Portal / Public Matches */}
      <PublicRoomsList 
        rooms={publicRooms}
        onJoin={(id) => handleJoinRoom(id)}
      />
    </div>
  );
}
