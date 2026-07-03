'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  KanbanSquare,
  Settings,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { WorkspaceSwitcher } from '@/components/shared/workspace-switcher'
import { Logo } from '@/components/shared/logo'
import { Separator } from '@/components/ui/separator'

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/leads', label: 'Leads', icon: Users },
  { href: '/pipeline', label: 'Pipeline', icon: KanbanSquare },
  { href: '/settings', label: 'Configurações', icon: Settings },
]

interface SidebarProps {
  mobileOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname()

  const content = (
    <div className="flex flex-col h-full">
      {/* Logo + close button (mobile) */}
      <div className="flex items-center justify-between px-4 py-4 shrink-0">
        <Logo size="md" />
        {/* Only visible on mobile */}
        <button
          onClick={onClose}
          className="lg:hidden p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
          aria-label="Fechar menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <Separator className="bg-border shrink-0" />

      {/* Workspace switcher */}
      <div className="px-3 py-3 shrink-0">
        <WorkspaceSwitcher />
      </div>

      <Separator className="bg-border shrink-0" />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 pb-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          Menu
        </p>
        {NAV_LINKS.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                'relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
              )}
              style={active ? {
                background: 'linear-gradient(90deg, rgba(var(--accent-lime-rgb), 0.08), transparent)',
              } : undefined}
            >
              {/* Active indicator bar */}
              {active && (
                <span
                  className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full"
                  style={{ background: 'var(--accent-lime)' }}
                />
              )}
              <Icon
                className={cn(
                  'w-4 h-4 shrink-0',
                  active ? 'text-foreground' : 'text-muted-foreground'
                )}
              />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 shrink-0 border-t border-border">
        <p className="px-3 text-[11px] text-muted-foreground">
          v0.3.0 · Pipeline Kanban
        </p>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar — always visible on lg+ */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-60 border-r border-border bg-card z-40">
        {content}
      </aside>

      {/* Mobile drawer */}
      <>
        {/* Backdrop */}
        <div
          className={cn(
            'fixed inset-0 z-[51] bg-black/60 backdrop-blur-sm transition-opacity lg:hidden',
            mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          )}
          onClick={onClose}
          aria-hidden="true"
        />
        {/* Drawer panel */}
        <aside
          className={cn(
            'fixed left-0 top-0 h-full w-64 bg-card border-r border-border z-[52] flex flex-col transition-transform duration-300 ease-in-out lg:hidden',
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {content}
        </aside>
      </>
    </>
  )
}
