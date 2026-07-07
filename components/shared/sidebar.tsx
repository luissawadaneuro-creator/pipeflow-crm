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
import type { Workspace } from '@/types'

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/leads', label: 'Leads', icon: Users },
  { href: '/pipeline', label: 'Pipeline', icon: KanbanSquare },
  { href: '/settings', label: 'Configurações', icon: Settings },
]

interface SidebarProps {
  mobileOpen?: boolean
  onClose?: () => void
  workspaces: Pick<Workspace, 'id' | 'name' | 'slug' | 'plan'>[]
  activeWorkspaceId: string
}

export function Sidebar({ mobileOpen = false, onClose, workspaces, activeWorkspaceId }: SidebarProps) {
  const pathname = usePathname()

  const content = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4 shrink-0">
        <Logo size="md" />
        <button
          onClick={onClose}
          className="lg:hidden p-1 rounded transition-colors nav-item-inactive"
          aria-label="Fechar menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <Separator style={{ background: 'var(--pf-border-subtle)' }} className="shrink-0" />

      {/* Workspace switcher */}
      <div className="px-3 py-3 shrink-0">
        <WorkspaceSwitcher workspaces={workspaces} activeWorkspaceId={activeWorkspaceId} />
      </div>

      <Separator style={{ background: 'var(--pf-border-subtle)' }} className="shrink-0" />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 pb-2 nav-label">
          Menu
        </p>
        {NAV_LINKS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                'relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150',
                active ? 'nav-item-active' : 'nav-item-inactive',
              )}
            >
              {active && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full nav-accent-bar" />
              )}
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 shrink-0 sidebar-footer">
        <p className="px-3 nav-label">v0.3.0</p>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-60 z-40 sidebar-root">
        {content}
      </aside>

      {/* Mobile drawer */}
      <>
        <div
          className={cn(
            'fixed inset-0 z-[51] bg-black/60 backdrop-blur-sm transition-opacity lg:hidden',
            mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          )}
          onClick={onClose}
          aria-hidden="true"
        />
        <aside
          className={cn(
            'fixed left-0 top-0 h-full w-64 z-[52] flex flex-col transition-transform duration-300 ease-in-out lg:hidden sidebar-root',
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {content}
        </aside>
      </>
    </>
  )
}
