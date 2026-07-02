'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MOCK_MEMBERS } from '@/lib/mock-leads'

export function LeadsFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const q: string = searchParams.get('q') ?? ''
  const status: string = searchParams.get('status') ?? ''
  const assigned: string = searchParams.get('assigned') ?? ''

  const createQuery = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString())
      Object.entries(updates).forEach(([k, v]) => {
        if (v) params.set(k, v)
        else params.delete(k)
      })
      return params.toString()
    },
    [searchParams]
  )

  function push(updates: Record<string, string>) {
    const qs = createQuery(updates)
    router.push(`${pathname}${qs ? `?${qs}` : ''}`)
  }

  const hasFilters = q || status || assigned

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-xs">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          className="pl-8 h-8 text-sm"
          placeholder="Buscar por nome ou empresa…"
          defaultValue={q}
          onChange={(e) => {
            // Debounce via onChange → push on each keystroke (acceptable for mock)
            push({ q: e.target.value, status, assigned })
          }}
        />
      </div>

      {/* Status filter */}
      <Select
        value={status || 'all'}
        onValueChange={(v) => push({ q, status: (v ?? '') === 'all' ? '' : (v ?? ''), assigned })}
      >
        <SelectTrigger className="h-8 w-36 text-sm">
          <SelectValue>{(v: string) => ({ all: 'Todos os status', new: 'Novo', contacted: 'Contatado', qualified: 'Qualificado', lost: 'Perdido' })[v] ?? v}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os status</SelectItem>
          <SelectItem value="new">Novo</SelectItem>
          <SelectItem value="contacted">Contatado</SelectItem>
          <SelectItem value="qualified">Qualificado</SelectItem>
          <SelectItem value="lost">Perdido</SelectItem>
        </SelectContent>
      </Select>

      {/* Responsible filter */}
      <Select
        value={assigned || 'all'}
        onValueChange={(v) => push({ q, status, assigned: (v ?? '') === 'all' ? '' : (v ?? '') })}
      >
        <SelectTrigger className="h-8 w-40 text-sm">
          <SelectValue>{(v: string) => v === 'all' ? 'Todos' : v}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          {MOCK_MEMBERS.map((m) => (
            <SelectItem key={m} value={m}>{m}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Clear filters */}
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
          onClick={() => router.push(pathname)}
        >
          <X className="w-3.5 h-3.5" />
          Limpar
        </Button>
      )}
    </div>
  )
}
