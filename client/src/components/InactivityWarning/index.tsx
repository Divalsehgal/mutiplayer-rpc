import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';

interface InactivityWarningProps {
  ttlWarning: number | null;
  onExtend: () => void;
}

export function InactivityWarning({ ttlWarning, onExtend }: InactivityWarningProps) {
  return (
    <AnimatePresence>
      {ttlWarning !== null && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-8 pointer-events-none">
          <motion.div 
            initial={{ y: -100, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            exit={{ y: -100, opacity: 0 }}
            className="pointer-events-auto bg-destructive/10 backdrop-blur-2xl border-2 border-destructive/50 p-6 rounded-2xl flex flex-col items-center gap-4 shadow-[0_0_50px_rgba(239,68,68,0.3)] max-w-md relative overflow-hidden"
          >
            {/* Warning Pulse Background */}
            <div className="absolute inset-0 bg-destructive/5 animate-pulse"></div>
            
            <div className="flex items-center gap-4 z-10 w-full">
              <div className="w-12 h-12 bg-destructive/20 rounded-full flex items-center justify-center border border-destructive/40 animate-bounce flex-shrink-0">
                <span className="text-2xl">⚠️</span>
              </div>
              <div className="flex flex-col">
                <span className="text-destructive text-[10px] font-black uppercase tracking-[0.3em]">Critical: Session Instability</span>
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">
                  PURGE IN {ttlWarning}S
                </h3>
              </div>
            </div>
            
            <p className="text-white/60 text-[10px] font-medium text-center z-10 leading-relaxed uppercase tracking-wide">
              Arena synchronization is failing. Manual override required to maintain connection.
            </p>

            <Button 
              variant="destructive" 
              onClick={onExtend} 
              className="w-full h-12 font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(239,68,68,0.2)] z-10"
            >
              STABILIZE CONNECTION
            </Button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
