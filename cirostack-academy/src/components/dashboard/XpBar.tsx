import { cn } from '@/lib/utils';
import { xpToLevel, xpToNextLevel } from '@/lib/utils';

interface XpBarProps {
  xpTotal: number;
  className?: string;
}

export default function XpBar({ xpTotal, className }: XpBarProps) {
  const level = xpToLevel(xpTotal);
  const needed = xpToNextLevel(xpTotal);
  const progress = ((xpTotal % 500) / 500) * 100;

  return (
    <div className={cn('', className)}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-[#E53935] flex items-center justify-center">
            <span className="text-xs font-bold text-white">{level}</span>
          </div>
          <span className="text-sm font-semibold text-[var(--color-text)]">Level {level}</span>
        </div>
        <span className="text-xs text-[var(--color-text-muted)]">{needed} XP to next</span>
      </div>

      <div className="h-2 rounded-full bg-[var(--color-border)]">
        <div
          className="h-full rounded-full bg-[#E53935] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-[var(--color-text-muted)] mt-1">{xpTotal.toLocaleString()} total XP</p>
    </div>
  );
}
