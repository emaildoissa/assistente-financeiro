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
  { href: '/conversations', label: 'Conversas', icon: MessageSquare },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button 
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 rounded-lg bg-black/40 border border-white/10 text-white backdrop-blur-md shadow-lg"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'flex flex-col border-r border-white/10 glass-card rounded-none z-50 transition-all duration-300',
        'fixed inset-y-0 left-0 transform md:relative md:translate-x-0',
        mobileOpen ? 'translate-x-0' : '-translate-x-full',
        collapsed ? 'md:w-16 w-64' : 'w-72 md:w-64',
      )}>
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
          {!collapsed && (
            <span className="font-bold text-xl text-gradient tracking-wide">
              Assessor
            </span>
          )}
          
          {/* Close button for Mobile */}
          <button 
            onClick={() => setMobileOpen(false)} 
            className="md:hidden p-1.5 hover:bg-white/10 text-text-muted hover:text-white rounded-lg transition-colors ml-auto"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Collapse button for Desktop */}
          <button 
            onClick={() => setCollapsed(!collapsed)} 
            className="hidden md:block p-1.5 hover:bg-white/10 text-text-muted hover:text-white rounded-lg transition-colors ml-auto"
          >
            <ChevronLeft className={cn('h-5 w-5 transition-transform duration-300', collapsed && 'rotate-180')} />
          </button>
        </div>

        <nav className="flex-1 space-y-1.5 p-3 overflow-y-auto">
          {links.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 group relative overflow-hidden',
                  isActive
                    ? 'bg-primary/20 text-blue-400 shadow-[inset_0_0_12px_rgba(59,130,246,0.2)]'
                    : 'text-text-muted hover:bg-white/5 hover:text-white',
                )}
                title={collapsed ? label : undefined}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-md shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                )}
                <Icon className={cn('h-5 w-5 shrink-0 transition-transform group-hover:scale-110', isActive && 'drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]')} />
                {(!collapsed || mobileOpen) && label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          {(!collapsed || mobileOpen) && user && (
            <div className="px-3 py-3 text-sm text-text-muted truncate bg-black/20 rounded-xl mb-2 border border-white/5">
              <span className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Usuário Logado</span>
              <span className="text-white font-medium">{user.name}</span>
            </div>
          )}
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 group"
            title="Sair"
          >
            <LogOut className="h-5 w-5 shrink-0 group-hover:scale-110 transition-transform" />
            {(!collapsed || mobileOpen) && 'Desconectar'}
          </button>
        </div>
      </aside>
    </>
  );
}
