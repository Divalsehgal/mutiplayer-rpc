import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Users, Gamepad2, Globe, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CreateRoomCardProps {
  playerName: string;
  setPlayerName: (name: string) => void;
  gameType: string;
  setGameType: (type: string) => void;
  isPublic: boolean;
  setIsPublic: (isPublic: boolean) => void;
  handleCreateRoom: () => void;
}

export const CreateRoomCard: React.FC<CreateRoomCardProps> = ({
  playerName,
  setPlayerName,
  gameType,
  setGameType,
  isPublic,
  setIsPublic,
  handleCreateRoom,
}) => {
  return (
    <Card className="border-2 border-primary/20 shadow-2xl bg-card/50 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="text-3xl font-black italic tracking-tighter flex items-center gap-3">
          <Gamepad2 className="w-8 h-8 text-primary" />
          FORGE NEW ARENA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">IDENTITY</label>
          <Input 
            placeholder="ENTER YOUR HANDLE" 
            value={playerName} 
            onChange={(e) => setPlayerName(e.target.value.toUpperCase())}
            className="h-14 text-lg font-bold border-2 focus-visible:ring-primary"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          {['RPS', 'TIC_TAC_TOE', 'SNAKE_LADDER'].map((type) => (
            <Button
              key={type}
              variant={gameType === type ? "default" : "outline"}
              onClick={() => setGameType(type)}
              className={`h-20 flex flex-col gap-2 font-black text-[10px] transition-all ${gameType === type ? 'scale-105 shadow-lg shadow-primary/20' : 'opacity-60 hover:opacity-100'}`}
            >
              <div className="bg-background/20 p-2 rounded-lg">
                <Users className="w-4 h-4" />
              </div>
              {type.replace('_', ' ')}
            </Button>
          ))}
        </div>

        <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl border border-border">
          <div className="flex items-center gap-3">
            {isPublic ? <Globe className="w-5 h-5 text-primary" /> : <Lock className="w-5 h-5 text-muted-foreground" />}
            <div>
              <p className="text-sm font-bold">{isPublic ? 'PUBLIC PORTAL' : 'PRIVATE LINK'}</p>
              <p className="text-[10px] text-muted-foreground font-medium">
                {isPublic ? 'Anyone can find and join' : 'Only those with the ID'}
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsPublic(!isPublic)}
            className="font-black text-[10px] border border-border"
          >
            SWITCH
          </Button>
        </div>

        <Button 
          onClick={handleCreateRoom} 
          className="w-full h-16 text-lg font-black italic tracking-wider shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
        >
          LAUNCH ARENA
        </Button>
      </CardContent>
    </Card>
  );
};
