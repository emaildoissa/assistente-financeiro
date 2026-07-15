import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        'flex h-10 w-full rounded-xl bg-surface-hover px-4 py-2 text-sm text-text-main placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';
