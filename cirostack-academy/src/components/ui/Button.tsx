'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'outline' | 'ghost' | 'destructive' | 'ai';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  asChild?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-[#E82121] text-white hover:bg-[#C41B1B] active:bg-[#A61515] border border-transparent',
  outline:
    'bg-transparent border border-[var(--color-border-2)] text-[var(--color-text)] hover:border-[#E82121] hover:text-[#E82121]',
  ghost:
    'bg-transparent border border-transparent text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]',
  destructive:
    'bg-[#EF4444] text-white hover:bg-[#DC2626] border border-transparent',
  ai: 'bg-[#7C3AED] text-white hover:bg-[#6D28D9] border border-transparent',
};

const sizeStyles: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm rounded-lg gap-1.5',
  md: 'h-10 px-4 text-sm rounded-lg gap-2',
  lg: 'h-12 px-6 text-base rounded-xl gap-2',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  children,
  className,
  asChild = false,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  const buttonClass = cn(
    'inline-flex items-center justify-center font-medium transition-all duration-150 cursor-pointer select-none',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E82121] focus-visible:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    variantStyles[variant],
    sizeStyles[size],
    fullWidth && 'w-full',
    className,
  );

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ className?: string }>, {
      className: cn(buttonClass, (children as React.ReactElement<{ className?: string }>).props.className),
    });
  }

  return (
    <button
      disabled={isDisabled}
      className={buttonClass}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      {children}
      {rightIcon && !isLoading && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
}
