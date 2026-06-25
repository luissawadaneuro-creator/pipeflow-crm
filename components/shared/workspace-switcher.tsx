'use client'

import { useState } from 'react'
import { Check, ChevronsUpDown, Plus, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import type { Workspace } from '@/types'

const FAKE_WORKSPACES: Pick<Workspace, 'id' | 'name' | 'plan'>[] = [
  { id: 'ws-1', name: 'Acme Vendas', plan: 'pro' },
  { id: 'ws-2', name: 'Freelancer Pessoal', plan: 'free' },
  { id: 'ws-3', name: 'StartupX', plan: 'free' },
]

export function WorkspaceSwitcher() {
  const [activeId, setActiveId] = useState('ws-1')
  const active = FAKE_WORKSPACES.find((w) => w.id === activeId) ?? FAKE_WORKSPACES[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="w-full flex items-center justify-between px-3 h-10 rounded-md font-medium text-sm text-foreground hover:bg-secondary/60 gap-2 transition-colors focus:outline-none"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex items-center justify-center w-6 h-6 rounded-md bg-primary/20 text-primary text-xs font-bold shrink-0">
            {active.name.charAt(0)}
          </span>
          <span className="truncate">{active.name}</span>
        </div>
        <ChevronsUpDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-60 bg-popover border-border"
        align="start"
        sideOffset={4}
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-muted-foreground font-normal px-2 py-1.5">
            Workspaces
          </DropdownMenuLabel>

          {FAKE_WORKSPACES.map((ws) => (
            <DropdownMenuItem
              key={ws.id}
              onClick={() => setActiveId(ws.id)}
              className="flex items-center justify-between px-2 py-2 cursor-pointer"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="flex items-center justify-center w-6 h-6 rounded-md bg-secondary text-foreground text-xs font-bold shrink-0">
                  {ws.name.charAt(0)}
                </span>
                <span className="truncate text-sm">{ws.name}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {ws.plan === 'pro' && (
                  <Badge className="h-4 px-1.5 text-[10px] bg-primary/20 text-primary border-0 font-semibold">
                    PRO
                  </Badge>
                )}
                {ws.id === activeId && (
                  <Check className="w-3.5 h-3.5 text-primary" />
                )}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-border" />

        <DropdownMenuGroup>
          <DropdownMenuItem className="flex items-center gap-2 px-2 py-2 cursor-pointer text-muted-foreground hover:text-foreground">
            <Plus className="w-4 h-4" />
            <span className="text-sm">Criar workspace</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
