export const Loader = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full gap-8">
      <div className="relative w-24 h-24">
        {/* Outer pulse */}
        <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping opacity-20" />
        
        {/* Spinning rings */}
        <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin" />
        <div className="absolute inset-2 rounded-full border-b-2 border-primary/40 animate-spin-slow" />
        
        {/* Center core */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_15px_rgba(var(--primary),0.8)]" />
        </div>
      </div>
      
      <div className="flex flex-col items-center gap-2">
        <span className="text-[10px] font-black tracking-[0.4em] text-white/40 uppercase animate-pulse">
          Initializing_Node
        </span>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div 
              key={i}
              className="w-1 h-1 rounded-full bg-primary/40 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
