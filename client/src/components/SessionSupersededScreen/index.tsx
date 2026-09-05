import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';

/**
 * Shown on the Room/Game screens once this tab's session has been superseded
 * by the same player joining from another tab or device (see useRoomConnection's
 * "session-taken-over" handling). This tab's room state is now stale.
 */
export function SessionSupersededScreen() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen flex-col items-center justify-center p-6 text-center bg-black overflow-hidden relative">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="z-10 flex flex-col items-center">
        <div className="text-8xl mb-6">📱</div>
        <h2 className="text-4xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-accent to-accent/50 uppercase tracking-tighter">Active Elsewhere</h2>
        <p className="text-muted-foreground mb-8 max-w-sm font-medium tracking-wide">You joined this room from another tab or device. This session is no longer live.</p>
        <Button variant="glow" onClick={() => navigate('/')} className="px-12 font-black uppercase tracking-widest h-14">Back to Lobby</Button>
      </motion.div>
    </div>
  );
}
