import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

const variants = {
  default: 'bg-primary/20 text-blue-400 hover:bg-primary/30 border border-primary/30 shadow-[inset_0_0_10px_rgba(59,130,246,0.2)] hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]',
  destructive: 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 shadow-[inset_0_0_10px_rgba(239,68,68,0.2)]',
  outline: 'border border-white/10 bg-white/5 text-text-main hover:bg-white/10 hover:border-white/20',
  ghost: 'text-text-muted hover:bg-white/10 hover:text-white',
  link: 'text-blue-400 underline-offset-4 hover:underline',
} as const;

const sizes = {
  default: 'h-10 px-4 py-2',
  sm: 'h-9 rounded-md px-3',
  lg: 'h-11 rounded-md px-8',
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
        'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = 'Button';
