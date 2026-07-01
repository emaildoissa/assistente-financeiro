'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../../lib/utils';
import { useAuth } from '../../lib/auth-context';
import {
  LayoutDashboard, DollarSign, Tags, CheckSquare, FolderKanban,
  Bell, MessageSquare, LogOut, ChevronLeft,
} from 'lucide-react';
import { useState } from 'react';

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

  return (
    <aside className={cn(
      'flex flex-col border-r border-gray-200 bg-white transition-all duration-200',
      collapsed ? 'w-16' : 'w-60',
    )}>
      <div className="flex h-14 items-center justify-between border-b px-4">
        {!collapsed && <span className="font-bold text-lg">Assessor</span>}
        <button onClick={() => setCollapsed(!collapsed)} className="p-1 hover:bg-gray-100 rounded">
          <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
        </button>
      </div>

      <nav className="flex-1 space-y-1 p-2">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              pathname === href || pathname.startsWith(href + '/')
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50',
            )}
            title={collapsed ? label : undefined}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && label}
          </Link>
        ))}
      </nav>

      <div className="border-t p-2">
        {!collapsed && user && (
          <div className="px-3 py-2 text-sm text-gray-500 truncate">{user.name}</div>
        )}
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          title="Sair"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && 'Sair'}
        </button>
      </div>
    </aside>
  );
}
