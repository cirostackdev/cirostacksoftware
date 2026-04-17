'use client';

import { cn } from '@/lib/utils';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export default function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-[var(--color-text)]"
        >
          {label}
          {props.required && <span className="text-[#EF4444] ml-0.5">*</span>}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
            {leftIcon}
          </span>
        )}
        <input
          id={inputId}
          className={cn(
            'w-full h-10 rounded-lg border bg-[var(--color-surface)] text-[var(--color-text)]',
            'px-3 text-sm transition-colors duration-150',
            'placeholder:text-[var(--color-text-subtle)]',
            'focus:outline-none focus:ring-2 focus:ring-[#E82121] focus:border-[#E82121]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error
              ? 'border-[#EF4444] focus:ring-[#EF4444] focus:border-[#EF4444]'
              : 'border-[var(--color-border-2)]',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
            {rightIcon}
          </span>
        )}
      </div>

      {error && <p className="text-xs text-[#EF4444]">{error}</p>}
      {hint && !error && <p className="text-xs text-[var(--color-text-muted)]">{hint}</p>}
    </div>
  );
}
