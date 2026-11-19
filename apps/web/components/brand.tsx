import { Orbit } from 'lucide-react';
import { cn } from '@/lib/cn';

export function Brand({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="grid size-9 shrink-0 place-items-center rounded-lg border border-blue-400/30 bg-blue-500/10 text-cyan-300 shadow-[inset_0_0_16px_rgba(34,211,238,0.08)]">
        <Orbit aria-hidden="true" className="size-5" strokeWidth={1.8} />
      </div>
      {!compact && (
        <div className="leading-none">
          <div className="text-[15px] font-semibold tracking-[0.13em] text-white">NEXORA</div>
          <div className="mt-1 text-[9px] font-medium tracking-[0.34em] text-cyan-400">AI</div>
        </div>
      )}
    </div>
  );
}
