import { Player } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const Players = ({ players }: { players: Player[] }) => {
  return (
    <div className="glass-panel p-6 rounded-3xl border border-white/5" 
         style={{ backgroundColor: 'rgba(255, 255, 255, 0.01)' }}>
      <div className="flex flex-col items-start gap-6 w-full">
        <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
                <Users size={16} className="text-primary" style={{ color: 'var(--primary)' }} />
                <span className="text-[10px] font-black tracking-[0.2em] uppercase text-white" 
                      style={{ opacity: 0.4 }}>PLAYERS</span>
            </div>
            <Badge variant="outline" className="border-primary/20 text-primary rounded-full px-3 py-0.5 text-[10px] font-black uppercase tracking-tighter"
                   style={{ borderColor: 'rgba(var(--primary-rgb), 0.2)', color: 'var(--primary)', backgroundColor: 'rgba(var(--primary-rgb), 0.05)' }}>
                {players.length} ONLINE
            </Badge>
        </div>

        <div className="flex flex-col gap-3 w-full">
          {players.length === 0 ? (
            <span className="text-[10px] font-black italic uppercase tracking-widest text-white"
                  style={{ opacity: 0.2 }}>Awaiting players...</span>
          ) : (
            <AnimatePresence mode="popLayout">
                {players.map((p: Player, index: number) => (
                    <motion.div
                        key={p.playerUid}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <div 
                            className="flex items-center justify-between w-full p-4 rounded-2xl border transition-all duration-300 group cursor-default"
                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', borderColor: 'rgba(255, 255, 255, 0.05)' }}
                        >
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-black border uppercase text-white"
                                         style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.05)', opacity: 0.4 }}>
                                        {p.name?.charAt(0).toUpperCase() || "?"}
                                    </div>
                                    <div 
                                        className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#0a0a0c] ${
                                            p.status === "online" ? "bg-green-400" : "bg-red-400"
                                        }`}
                                        style={p.status === "online" ? { boxShadow: '0 0 8px rgba(74,222,128,0.5)' } : {}}
                                    />
                                </div>
                                <div className="flex flex-col items-start gap-0">
                                    <span className="text-[13px] font-black text-white tracking-tight leading-tight uppercase">
                                        {p.name || "ANONYMOUS"}
                                    </span>
                                    <span className="text-[9px] font-black tracking-widest uppercase italic text-white"
                                          style={{ opacity: 0.3 }}>
                                        {p.role.toUpperCase()}
                                    </span>
                                </div>
                            </div>

                            {p.status === "online" && (
                                <Radio size={14} className="animate-pulse transition-colors" 
                                       style={{ color: 'rgba(74, 222, 128, 0.4)' }} />
                            )}
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
};
