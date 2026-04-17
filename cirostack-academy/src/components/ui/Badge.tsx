import { cn } from '@/lib/utils';

type BadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'blue'
  | 'purple'
  | 'outline'
  | 'gold';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)] border border-[var(--color-border)]',
  success: 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20',
  warning: 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20',
  danger: 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20',
  info: 'bg-[#4FA3FF]/10 text-[#4FA3FF] border border-[#4FA3FF]/20',
  blue: 'bg-[#E82121]/10 text-[#E82121] border border-[#E82121]/20',
  purple: 'bg-[#7C3AED]/10 text-[#7C3AED] border border-[#7C3AED]/20',
  outline: 'bg-transparent text-[var(--color-text)] border border-[var(--color-border-2)]',
  gold: 'bg-[#F59E0B]/10 text-[#D97706] border border-[#F59E0B]/20',
};

export default function Badge({ variant = 'default', children, className, onClick }: BadgeProps) {
  return (
    <span
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
