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
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className={cn(
        'relative z-50 w-full max-w-md mx-4 bg-white rounded-xl elevation-3 text-text-main',
        'max-h-[85vh] overflow-y-auto',
      )}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-base font-medium text-text-main">{title}</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-main text-xl leading-none transition-colors">&times;</button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
}
