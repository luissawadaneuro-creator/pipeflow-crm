'use client'

import { useState, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Plus, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LeadsTable } from '@/components/leads/leads-table'
import { LeadsFilters } from '@/components/leads/leads-filters'
import { LeadForm } from '@/components/leads/lead-form'
import { LeadsSkeleton } from '@/components/leads/leads-skeleton'
import { LeadStatusBadge } from '@/components/leads/lead-status-badge'
import { MOCK_LEADS } from '@/lib/mock-leads'
import type { Lead, LeadStatus } from '@/types'

function LeadsContent() {
  const searchParams = useSearchParams()
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS)
  const [creating, setCreating] = useState(false)

  const q = (searchParams.get('q') ?? '').toLowerCase()
  const status = searchParams.get('status') as LeadStatus | null
  const assigned = searchParams.get('assigned') ?? ''

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      if (q && !l.name.toLowerCase().includes(q) && !(l.company ?? '').toLowerCase().includes(q)) {
        return false
      }
      if (status && l.status !== status) return false
      if (assigned && l.assigned_to !== assigned) return false
      return true
    })
  }, [leads, q, status, assigned])

  // Count by status
  const counts = useMemo(() => {
    const map: Record<string, number> = {}
    leads.forEach((l) => { map[l.status] = (map[l.status] ?? 0) + 1 })
    return map
  }, [leads])

  function handleCreate(data: Parameters<typeof LeadForm>[0]['onSave'] extends (d: infer D) => void ? D : never) {
    const newLead: Lead = {
      id: String(Date.now()),
      workspace_id: 'ws-1',
      ...data,
      email: data.email || null,
      phone: data.phone || null,
      company: data.company || null,
      role: data.role || null,
      assigned_to: data.assigned_to || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setLeads((prev) => [newLead, ...prev])
    setCreating(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Leads</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {leads.length} contatos no workspace
          </p>
        </div>
        <Button onClick={() => setCreating(true)} className="shrink-0">
          <Plus className="w-4 h-4 mr-1.5" />
          Novo lead
        </Button>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(['new', 'contacted', 'qualified', 'lost'] as LeadStatus[]).map((s) => (
          <div
            key={s}
            className="rounded-xl border border-border bg-card px-4 py-3 flex items-center justify-between"
          >
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                <LeadStatusBadge status={s} />
              </p>
              <p className="text-2xl font-bold text-foreground">{counts[s] ?? 0}</p>
            </div>
            <Users className="w-5 h-5 text-muted-foreground/40" />
          </div>
        ))}
      </div>

      {/* Filters */}
      <LeadsFilters />

      {/* Table */}
      {filtered.length === 0 && (q || status || assigned) ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground text-sm">
            Nenhum lead encontrado para os filtros aplicados.
          </p>
        </div>
      ) : (
        <LeadsTable leads={filtered} />
      )}

      {/* Create dialog */}
      <LeadForm
        open={creating}
        onClose={() => setCreating(false)}
        onSave={handleCreate}
      />
    </div>
  )
}

export default function LeadsPage() {
  return (
    <Suspense fallback={<LeadsSkeleton />}>
      <LeadsContent />
    </Suspense>
  )
}
