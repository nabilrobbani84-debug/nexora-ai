'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  Bell,
  Bot,
  ChevronLeft,
  CircleGauge,
  GitBranch,
  Inbox,
  LogOut,
  Menu,
  Network,
  Settings,
  Shield,
  Users,
} from 'lucide-react';
import type { SessionUser } from '@nexora/shared';
import { Brand } from '@/components/brand';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';

const navigation = [
  { label: 'Foundation', icon: CircleGauge, href: '/dashboard', active: true },
  { label: 'Executive Intelligence', icon: BarChart3, phase: 2 },
  { label: 'Customer Intelligence', icon: Network, phase: 2 },
  { label: 'Customers', icon: Users, phase: 2 },
  { label: 'Omnichannel Inbox', icon: Inbox, phase: 2 },
  { label: 'AI Intelligence', icon: Bot, phase: 3 },
  { label: 'Automation', icon: GitBranch, phase: 4 },
  { label: 'System Settings', icon: Settings, phase: 2 },
] as const;

interface AppShellProps {
  user: SessionUser;
  children: ReactNode;
  onLogout: () => void;
  loggingOut: boolean;
}

export function AppShell({ user, children, onLogout, loggingOut }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-dvh bg-[#080B14] text-slate-100">
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 hidden border-r border-slate-800 bg-[#0B101C] transition-[width] duration-200 md:flex md:flex-col',
          collapsed ? 'w-[76px]' : 'w-[248px]',
        )}
      >
        <div className={cn('flex h-20 items-center border-b border-slate-800 px-5', collapsed && 'justify-center px-0')}>
          <Brand compact={collapsed} />
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5" aria-label="Navigasi utama">
          {navigation.map(({ label, icon: Icon, ...item }) =>
            'href' in item ? (
              <Link
                key={label}
                href={item.href}
                className={cn('nav-item nav-item-active', collapsed && 'justify-center px-0')}
                title={collapsed ? label : undefined}
              >
                <Icon aria-hidden="true" className="size-[18px] shrink-0" strokeWidth={1.8} />
                {!collapsed && <span>{label}</span>}
              </Link>
            ) : (
              <div
                key={label}
                aria-disabled="true"
                className={cn('nav-item cursor-not-allowed opacity-45', collapsed && 'justify-center px-0')}
                title={collapsed ? `${label} · Phase ${item.phase}` : undefined}
              >
                <Icon aria-hidden="true" className="size-[18px] shrink-0" strokeWidth={1.8} />
                {!collapsed && (
                  <>
                    <span className="truncate">{label}</span>
                    <span className="ml-auto text-[9px] font-medium tracking-wider text-slate-600">P{item.phase}</span>
                  </>
                )}
              </div>
            ),
          )}
        </nav>
        <div className="border-t border-slate-800 p-3">
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            className={cn('nav-item w-full', collapsed && 'justify-center px-0')}
            aria-label={collapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
          >
            <ChevronLeft aria-hidden="true" className={cn('size-[18px] transition-transform', collapsed && 'rotate-180')} />
            {!collapsed && <span>Ciutkan menu</span>}
          </button>
        </div>
      </aside>

      <div className={cn('transition-[padding] duration-200 md:pl-[248px]', collapsed && 'md:pl-[76px]')}>
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-800 bg-[#080B14]/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="md:hidden"><Brand compact /></div>
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Platform</span><span>/</span><span className="text-slate-300">Foundation</span>
              </div>
              <h1 className="mt-1 text-sm font-medium text-white sm:text-base">System readiness</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="ghost" size="icon" aria-label="Notifikasi belum tersedia" disabled>
              <Bell className="size-[18px]" />
            </Button>
            <div className="hidden border-l border-slate-800 pl-4 sm:block">
              <div className="text-sm font-medium text-slate-200">{user.firstName} {user.lastName}</div>
              <div className="mt-0.5 text-xs text-slate-500">{user.organizationName}</div>
            </div>
            <Button variant="secondary" size="sm" onClick={onLogout} disabled={loggingOut}>
              <LogOut aria-hidden="true" className="size-4" />
              <span className="hidden lg:inline">{loggingOut ? 'Keluar…' : 'Keluar'}</span>
            </Button>
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
