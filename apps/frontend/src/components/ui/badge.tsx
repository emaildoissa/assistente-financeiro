import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

const colors: Record<string, string> = {
  paid: 'bg-green-400/10 text-green-400 ring-1 ring-inset ring-green-400/20',
  pending: 'bg-yellow-400/10 text-yellow-400 ring-1 ring-inset ring-yellow-400/20',
  overdue: 'bg-red-400/10 text-red-400 ring-1 ring-inset ring-red-400/20',
  cancelled: 'bg-gray-400/10 text-gray-400 ring-1 ring-inset ring-gray-400/20',
  done: 'bg-green-400/10 text-green-400 ring-1 ring-inset ring-green-400/20',
  in_progress: 'bg-blue-400/10 text-blue-400 ring-1 ring-inset ring-blue-400/20',
  income: 'bg-green-400/10 text-green-400 ring-1 ring-inset ring-green-400/20',
  expense: 'bg-red-400/10 text-red-400 ring-1 ring-inset ring-red-400/20',
};

export function Badge({ variant, children }: { variant: string; children: ReactNode }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', colors[variant] || 'bg-gray-100')}>
      {children}
    </span>
  );
}
