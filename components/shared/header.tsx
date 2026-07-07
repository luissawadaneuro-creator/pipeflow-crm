'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Menu, Bell, ChevronDown } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

const ROUTE_LABELS: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/leads': 'Leads',
  '/pipeline': 'Pipeline',
  '/settings': 'Configurações',
}

interface HeaderProps {
  onMenuClick?: () => void
  user: { name: string; email: string }
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  const initials = parts.length > 1 ? `${parts[0][0]}${parts[parts.length - 1][0]}` : parts[0].slice(0, 2)
  return initials.toUpperCase()
}

export function Header({ onMenuClick, user }: HeaderProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  // Resolve breadcrumb: match longest prefix
  const breadcrumb =
    Object.entries(ROUTE_LABELS)
      .sort((a, b) => b[0].length - a[0].length)
      .find(([route]) => pathname === route || pathname.startsWith(route + '/'))
      ?.[1] ?? 'PipeFlow'

  return (
    <header className="h-14 border-b border-border bg-card/60 backdrop-blur-sm flex items-center justify-between px-4 lg:px-6 shrink-0">
      {/* Left: hamburger (mobile) + breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
          aria-label="Abrir menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground hidden sm:block">PipeFlow</span>
          <span className="text-muted-foreground hidden sm:block">/</span>
          <span className="font-medium text-foreground">{breadcrumb}</span>
        </div>
      </div>

      {/* Right: notifications + user menu */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="relative w-8 h-8 text-muted-foreground hover:text-foreground"
          aria-label="Notificações"
        >
          <Bell className="w-4 h-4" />
          {/* Notification dot */}
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-secondary/60 transition-colors focus:outline-none">
            <Avatar className="w-7 h-7">
              <AvatarFallback className="bg-primary/20 text-primary text-[11px] font-bold">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <span className="hidden md:block text-sm font-medium text-foreground">
              {user.name.split(' ')[0]}
            </span>
            <ChevronDown className="hidden md:block w-3.5 h-3.5 text-muted-foreground" />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56 bg-popover border-border" sideOffset={6}>
            {/* User info — plain div, not a GroupLabel */}
            <div className="px-2 py-2 border-b border-border mb-1">
              <p className="text-sm font-medium text-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
            </div>
            <DropdownMenuGroup>
              <DropdownMenuItem className="cursor-pointer text-sm">
                Meu perfil
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer text-sm">
                Configurações
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuGroup>
              <DropdownMenuItem
                className="cursor-pointer text-sm text-destructive focus:text-destructive"
                onClick={() => { void handleSignOut() }}
              >
                Sair
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
