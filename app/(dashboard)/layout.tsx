'use client'

import { Sidebar } from '@/components/shared/sidebar'
import { Header } from '@/components/shared/header'
import { useSidebar } from '@/hooks/useSidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { open, toggle, close } = useSidebar()

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar mobileOpen={open} onClose={close} />

      {/* Desktop offset — matches sidebar width */}
      <div className="flex flex-col flex-1 lg:ml-60 min-w-0">
        <Header onMenuClick={toggle} />
        <main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
