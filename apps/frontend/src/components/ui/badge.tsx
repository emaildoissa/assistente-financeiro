import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

const colors: Record<string, string> = {
  paid: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  overdue: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-500',
  done: 'bg-green-100 text-green-800',
  in_progress: 'bg-blue-100 text-blue-800',
  income: 'bg-green-100 text-green-800',
  expense: 'bg-red-100 text-red-800',
};

export function Badge({ variant, children }: { variant: string; children: ReactNode }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', colors[variant] || 'bg-gray-100')}>
      {children}
    </span>
  );
}
