'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../../lib/utils';
import { useAuth } from '../../lib/auth-context';
import {
  LayoutDashboard, DollarSign, Tags, CheckSquare, FolderKanban,
  Bell, MessageSquare, LogOut, ChevronLeft, Menu, X
} from 'lucide-react';
import { useState, useEffect } from 'react';

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transações', icon: DollarSign },
  { href: '/categories', label: 'Categorias', icon: Tags },
  { href: '/tasks', label: 'Tarefas', icon: CheckSquare },
  { href: '/projects', label: 'Projetos', icon: FolderKanban },
  { href: '/reminders', label: 'Lembretes', icon: Bell },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <button 
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 rounded-xl bg-surface border border-border text-text-main shadow-warm"
      >
        <Menu className="h-5 w-5" />
      </button>

      {mobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/30 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={cn(
        'flex flex-col bg-surface border-r border-border z-50 transition-all duration-300',
        'fixed inset-y-0 left-0 transform md:relative md:translate-x-0',
        mobileOpen ? 'translate-x-0' : '-translate-x-full',
        collapsed ? 'md:w-16 w-64' : 'w-72 md:w-64',
      )}>
        <div className="flex h-14 items-center justify-between border-b border-border-light px-4">
          {!collapsed && (
            <span className="font-display font-bold text-lg text-text-main tracking-tight">
              Assessor
            </span>
          )}
          
          <button 
            onClick={() => setMobileOpen(false)} 
            className="md:hidden p-1.5 hover:bg-surface-hover text-text-muted hover:text-text-main rounded-lg transition-colors ml-auto"
          >
            <X className="h-4 w-4" />
          </button>

          <button 
            onClick={() => setCollapsed(!collapsed)} 
            className="hidden md:block p-1.5 hover:bg-surface-hover text-text-muted hover:text-text-main rounded-lg transition-colors ml-auto"
          >
            <ChevronLeft className={cn('h-4 w-4 transition-transform duration-300', collapsed && 'rotate-180')} />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 p-2 overflow-y-auto">
          {links.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors relative',
                  isActive
                    ? 'bg-surface-hover text-text-main font-medium'
                    : 'text-text-muted hover:bg-surface-hover hover:text-text-main',
                )}
                title={collapsed ? label : undefined}
              >
                {isActive && (
                  <div className="absolute left-0 top-1 bottom-1 w-0.5 bg-primary rounded-full" />
                )}
                <Icon className={cn('h-5 w-5 shrink-0', isActive ? 'text-primary' : '')} />
                {(!collapsed || mobileOpen) && label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border-light p-2">
          {(!collapsed || mobileOpen) && user && (
            <div className="px-3 py-2 text-sm text-text-muted truncate bg-surface-hover rounded-xl mb-1">
              <span className="block text-xs text-text-muted/70 mb-0.5">Logado</span>
              <span className="text-text-main font-medium">{user.name}</span>
            </div>
          )}
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-error hover:bg-red-50 transition-colors"
            title="Sair"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {(!collapsed || mobileOpen) && 'Desconectar'}
          </button>
        </div>
      </aside>
    </>
  );
}
