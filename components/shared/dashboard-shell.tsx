'use client'

import { Sidebar } from '@/components/shared/sidebar'
import { Header } from '@/components/shared/header'
import { useSidebar } from '@/hooks/useSidebar'
import type { Workspace } from '@/types'

interface DashboardShellProps {
  children: React.ReactNode
  workspaces: Pick<Workspace, 'id' | 'name' | 'slug' | 'plan'>[]
  activeWorkspaceId: string
  user: { name: string; email: string }
}

export function DashboardShell({ children, workspaces, activeWorkspaceId, user }: DashboardShellProps) {
  const { open, toggle, close } = useSidebar()

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar
        mobileOpen={open}
        onClose={close}
        workspaces={workspaces}
        activeWorkspaceId={activeWorkspaceId}
      />

      {/* Desktop offset — matches sidebar width */}
      <div className="flex flex-col flex-1 lg:ml-60 min-w-0">
        <Header onMenuClick={toggle} user={user} />
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <div className="animate-fade-slide-up h-full">{children}</div>
        </main>
      </div>
    </div>
  )
}
