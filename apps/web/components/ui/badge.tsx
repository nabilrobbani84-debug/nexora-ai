import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border border-slate-700 bg-slate-900 px-2 py-0.5 text-xs font-medium text-slate-300',
        className,
      )}
      {...props}
    />
  );
}
