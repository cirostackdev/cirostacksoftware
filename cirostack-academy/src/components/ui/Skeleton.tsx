import { cn } from '@/lib/utils';

export default function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse-slow rounded-lg bg-[var(--color-surface-2)]',
        className
      )}
      {...props}
    />
  );
}
