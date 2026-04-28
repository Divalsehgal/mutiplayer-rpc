import { motion } from "framer-motion";
import { Sword, Shield, Scissors } from "lucide-react";
import { RoomState, RPSState } from "@/types";

const CHOICES = {
  Rock: { name: "Rock", icon: Sword },
  Paper: { name: "Paper", icon: Shield },
  Scissors: { name: "Scissors", icon: Scissors }
} as const;

interface PlayingViewProps {
  room: RoomState;
  playerUid: string;
  isPlayer: boolean;
  hasSelected: boolean;
  selected: string | null;
  handleSelect: (choice: string) => void;
}

export const PlayingView = ({ 
  room, 
  playerUid, 
  isPlayer, 
  hasSelected, 
  selected, 
  handleSelect 
}: PlayingViewProps) => {
  const rpsState = room.gameState as RPSState;

  return (
    <motion.div
      key="playing"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      className="w-full max-w-4xl mx-auto flex flex-col items-center gap-12 py-8"
      style={{ margin: '0 auto' }}
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-black italic tracking-tighter arcade-font text-white uppercase"
        >
          {hasSelected ? "Move Locked" : "Choose Your Move"}
        </motion.h2>
        <div className="flex items-center gap-4">
          <div className="badge-terminal px-5 py-1 bg-primary/10 border border-primary/20 text-primary">
            ROUND {rpsState?.roundCount}
          </div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[10px] font-black tracking-[0.3em] text-primary opacity-60 uppercase"
          >
            {hasSelected ? "Waiting for opponent..." : "Select your move to engage"}
          </motion.p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full px-4">
        {(Object.keys(CHOICES) as (keyof typeof CHOICES)[]).map((choice, index) => {
          const Icon = CHOICES[choice].icon;
          const isChoiceSelected = (rpsState?.playerChoices?.[playerUid] === choice) || (selected === choice);
          
          return (
            <motion.button
              key={choice}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={!hasSelected ? { scale: 1.05, y: -5 } : {}}
              whileTap={!hasSelected ? { scale: 0.95 } : {}}
              disabled={hasSelected || !isPlayer}
              onClick={() => handleSelect(choice)}
              className={`group relative p-8 rounded-3xl border-2 transition-all flex flex-col items-center gap-6 overflow-hidden arcade-panel bg-black/40 backdrop-blur-md ${
                isChoiceSelected 
                  ? 'border-primary shadow-[0_0_50px_rgba(var(--primary-rgb),0.3)]' 
                  : hasSelected 
                    ? 'opacity-40 grayscale pointer-events-none'
                    : 'border-white/5 hover:border-primary/40'
              }`}
            >
              {/* CRT Effect on buttons */}
              <div className="absolute inset-0 pointer-events-none opacity-20 z-10" 
                   style={{ backgroundImage: 'linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.1) 50%), linear-gradient(90deg, rgba(255,0,0,0.02), rgba(0,255,0,0.01), rgba(0,0,255,0.02))', backgroundSize: '100% 2px, 3px 100%' }} />
              
              <div className={`p-6 rounded-2xl transition-colors relative z-20 ${
                isChoiceSelected ? 'bg-primary/20' : 'bg-white/5 group-hover:bg-primary/10'
              }`}>
                <Icon size={48} className={isChoiceSelected ? 'text-primary animate-pulse' : 'text-white group-hover:text-primary'} />
              </div>

              <div className="flex flex-col items-center gap-1 relative z-20">
                <span className={`text-xl font-black italic arcade-font ${isChoiceSelected ? 'text-primary' : 'text-white'}`}>
                  {choice.toUpperCase()}
                </span>
                <div className={`h-1 w-12 rounded-full transition-all ${isChoiceSelected ? 'bg-primary' : 'bg-white/10 group-hover:bg-primary/40'}`} />
              </div>

              {isChoiceSelected && (
                <motion.div 
                  layoutId="selection-glow"
                  className="absolute inset-0 bg-primary/5 blur-3xl"
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {hasSelected && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 px-6 py-3 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm"
        >
          <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
          <span className="text-[10px] font-black tracking-widest text-primary uppercase">Waiting for other players...</span>
        </motion.div>
      )}
    </motion.div>
  );
};
