import { Spectator } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Ghost } from "lucide-react";

export const Spectators = ({ spectators }: { spectators: Spectator[] }) => {
  return (
    <div className="glass-panel p-6 rounded-3xl border border-white/5" 
         style={{ backgroundColor: 'rgba(255, 255, 255, 0.01)' }}>
      <div className="flex flex-col items-start gap-6 w-full">
        <div className="flex items-center gap-2">
            <Eye size={16} style={{ color: 'var(--accent-purple)' }} />
            <span className="text-[10px] font-black tracking-[0.2em] uppercase text-white"
                  style={{ opacity: 0.4 }}>SPECTATORS</span>
            <span className="ml-auto text-[10px] font-black border rounded-full px-2 py-0.5"
                  style={{ color: 'rgba(var(--accent-purple-rgb), 0.6)', backgroundColor: 'rgba(var(--accent-purple-rgb), 0.05)', borderColor: 'rgba(var(--accent-purple-rgb), 0.1)' }}>
                {spectators.length}
            </span>
        </div>

        <div className="flex flex-wrap gap-3 w-full">
          {spectators.length === 0 ? (
            <span className="text-[10px] font-black italic uppercase tracking-widest text-white"
                  style={{ opacity: 0.2 }}>No spectators...</span>
          ) : (
            <AnimatePresence>
              {spectators.map((s, index) => (
                <motion.div
                  key={s.playerUid}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.03 }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all group ${
                    s.status === "offline" ? "opacity-30 grayscale" : ""
                  }`}
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', borderColor: 'rgba(255, 255, 255, 0.05)' }}
                >
                  <div className="relative">
                    <Ghost size={12} className="transition-colors text-white" style={{ opacity: 0.2 }} />
                    {s.status === "offline" && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 border border-black" />
                    )}
                  </div>
                  <span className="text-[10px] font-black tracking-tight uppercase text-white"
                        style={{ opacity: 0.6 }}>
                    {s.name || s.playerUid.slice(0, 4)}
                    {s.status === "offline" && " (OFFLINE)"}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
};
