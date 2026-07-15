'use client';

import { useEffect, type ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Dialog({ open, onClose, title, children }: DialogProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className={cn(
        'relative z-50 w-full max-w-md mx-4 bg-surface rounded-2xl shadow-warm-lg text-text-main border border-border',
        'max-h-[85vh] overflow-y-auto',
        'before:block before:h-1 before:w-full before:bg-primary before:rounded-t-2xl before:absolute before:top-0 before:left-0',
      )}>
        <div className="flex items-center justify-between p-5 pt-5 border-b border-border-light">
          <h2 className="font-display text-base font-semibold text-text-main">{title}</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-main text-xl leading-none transition-colors">&times;</button>
        </div>
        <div className="p-5">
          {children}
        </div>
      </div>
    </div>
  );
}
