import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Users, Gamepad2, Globe } from 'lucide-react';
import { RoomState } from '../../../types';

interface PublicRoomsListProps {
  rooms: RoomState[];
  onJoin: (roomId: string) => void;
}

export const PublicRoomsList: React.FC<PublicRoomsListProps> = ({ rooms, onJoin }) => {
  return (
    <div className="flex-1 flex flex-col gap-4 min-h-0">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black italic tracking-tight flex items-center gap-3">
          <Globe className="w-6 h-6 text-primary" />
          GLOBAL PORTAL
        </h2>
        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          {rooms.length} MATCHES ACTIVE
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {rooms.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-border rounded-xl"
            >
              <Gamepad2 className="w-16 h-16 text-muted-foreground/20 mb-4" />
              <h3 className="text-xl font-bold opacity-50">NO PUBLIC GAMES</h3>
              <p className="text-sm text-muted-foreground">Start a match to be the first on the portal!</p>
            </motion.div>
          ) : (
            rooms.map((room) => (
              <motion.div
                key={room.id}
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card 
                  className="group hover:border-primary/50 transition-colors cursor-pointer" 
                  onClick={() => onJoin(room.id)}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                        <Gamepad2 className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black tracking-tight">{room.id.split('-')[0]}'s Arena</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary font-bold border border-border">
                            {room.gameType}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {room.players.length} / {room.maxPlayers}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                          <span>Room ID: <span className="font-mono">{room.id}</span></span>
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" className="group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      JOIN ARENA
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
