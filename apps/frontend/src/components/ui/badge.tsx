import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

const colors: Record<string, string> = {
  paid: 'bg-green-50 text-success ring-1 ring-inset ring-success/20',
  pending: 'bg-yellow-50 text-warning ring-1 ring-inset ring-warning/20',
  overdue: 'bg-red-50 text-error ring-1 ring-inset ring-error/20',
  cancelled: 'bg-gray-50 text-text-muted ring-1 ring-inset ring-border',
  done: 'bg-green-50 text-success ring-1 ring-inset ring-success/20',
  in_progress: 'bg-blue-50 text-secondary ring-1 ring-inset ring-secondary/20',
  income: 'bg-green-50 text-success ring-1 ring-inset ring-success/20',
  expense: 'bg-red-50 text-error ring-1 ring-inset ring-error/20',
  income_expense: 'bg-blue-50 text-secondary ring-1 ring-inset ring-secondary/20',
};

export function Badge({ variant, children }: { variant: string; children: ReactNode }) {
  return (
    <span className={cn('inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium', colors[variant] || 'bg-gray-100 text-text-muted')}>
      {children}
    </span>
  );
}
