import Image from 'next/image';
import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/utils';

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeConfig = {
  sm: { container: 'h-7 w-7', text: 'text-xs' },
  md: { container: 'h-9 w-9', text: 'text-sm' },
  lg: { container: 'h-12 w-12', text: 'text-base' },
  xl: { container: 'h-16 w-16', text: 'text-xl' },
};

export default function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const { container, text } = sizeConfig[size];

  return (
    <div
      className={cn(
        'rounded-full overflow-hidden shrink-0 bg-[#E82121]/10 flex items-center justify-center',
        'border border-[var(--color-border)]',
        container,
        className
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={name}
          width={64}
          height={64}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className={cn('font-semibold text-[#E82121]', text)}>
          {getInitials(name)}
        </span>
      )}
    </div>
  );
}
