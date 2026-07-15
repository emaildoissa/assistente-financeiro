import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

const variants = {
  default: 'bg-black text-white hover:bg-black/80',
  destructive: 'bg-primary text-white hover:bg-primary-hover',
  outline: 'border border-border bg-white text-text-main hover:bg-surface',
  ghost: 'text-text-muted hover:bg-surface hover:text-text-main',
  link: 'text-secondary underline-offset-4 hover:underline',
  subscribe: 'bg-primary text-white hover:bg-primary-hover',
  subscribed: 'bg-surface text-text-main hover:bg-surface-hover',
} as const;

const sizes = {
  default: 'h-9 px-4 py-2',
  sm: 'h-8 rounded-full px-3 text-xs',
  lg: 'h-11 rounded-full px-8',
  icon: 'h-10 w-10',
} as const;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = 'Button';
