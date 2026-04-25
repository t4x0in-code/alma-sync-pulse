export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <div className="h-9 w-9 rounded-full bg-gradient-fire shadow-glow" />
        <div className="absolute inset-0 flex items-center justify-center font-display text-base text-primary-foreground">
          AL
        </div>
      </div>
      <div className="flex flex-col leading-none">
        <span className="font-display text-xl tracking-wider">ALMA</span>
        <span className="font-display text-xl tracking-[0.3em] text-gradient-fire -mt-1">
          LATINA
        </span>
      </div>
    </div>
  );
}
