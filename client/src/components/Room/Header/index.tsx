import { Copy, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export const RoomHeader = ({ roomId }: { roomId: string }) => {
  const { toast } = useToast();

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast({
        title: "COPIED",
        description: "Room ID link copied to clipboard",
        className: "bg-black border-primary/20 text-white font-mono",
      });
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="flex items-center justify-between py-4 border-b" 
         style={{ borderBottomColor: 'rgba(var(--primary-rgb), 0.1)' }}>
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg border" 
             style={{ backgroundColor: 'rgba(var(--primary-rgb), 0.1)', borderColor: 'rgba(var(--primary-rgb), 0.2)' }}>
          <Terminal className="w-5 h-5 text-primary" style={{ color: 'var(--primary)' }} />
        </div>
        <div>
          <h1 className="text-[10px] font-black tracking-[0.3em] uppercase opacity-40 text-white">
            Active_Session
          </h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyRoomId}
            className="h-auto p-0 hover:bg-transparent group flex items-center gap-2"
          >
            <span className="text-sm font-mono transition-colors"
                  style={{ color: 'var(--primary)' }}>
              {roomId}
            </span>
            <Copy className="w-3 h-3 transition-colors" 
                  style={{ color: 'rgba(255, 255, 255, 0.2)' }} />
          </Button>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold tracking-widest uppercase opacity-30 text-white">
            Status
          </span>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" 
                 style={{ backgroundColor: 'var(--primary)', boxShadow: '0 0 8px rgba(var(--primary-rgb), 0.6)' }} />
            <span className="text-xs font-mono opacity-90 text-white">ENCRYPTED</span>
          </div>
        </div>
      </div>
    </div>
  );
};
