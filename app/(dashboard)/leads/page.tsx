import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { Users } from 'lucide-react'
import { LeadsTable } from '@/components/leads/leads-table'
import { LeadsFilters } from '@/components/leads/leads-filters'
import { LeadsSkeleton } from '@/components/leads/leads-skeleton'
import { LeadStatusBadge } from '@/components/leads/lead-status-badge'
import { NewLeadButton } from '@/components/leads/new-lead-button'
import { createClient } from '@/lib/supabase/server'
import { getActiveWorkspaceContext } from '@/lib/supabase/workspace-context'
import { getLeads, getWorkspaceMembers } from '@/lib/supabase/queries'
import type { LeadStatus } from '@/types'

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string; assigned?: string }>
}

async function LeadsContent({ searchParams }: PageProps) {
  const params = await searchParams
  const supabase = await createClient()
  const context = await getActiveWorkspaceContext(supabase)
  if (!context) redirect('/login')

  const status = (params.status as LeadStatus | undefined) || undefined
  const [leads, allLeads, members] = await Promise.all([
    getLeads(supabase, context.workspaceId, {
      q: params.q,
      status,
      assigned: params.assigned,
    }),
    getLeads(supabase, context.workspaceId),
    getWorkspaceMembers(supabase, context.workspaceId),
  ])

  const counts: Record<string, number> = {}
  allLeads.forEach((l) => {
    counts[l.status] = (counts[l.status] ?? 0) + 1
  })

  const hasFilters = !!(params.q || params.status || params.assigned)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Leads</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {allLeads.length} contatos no workspace
          </p>
        </div>
        <NewLeadButton members={members} />
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
      <LeadsFilters members={members} />

      {/* Table */}
      {leads.length === 0 && hasFilters ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground text-sm">
            Nenhum lead encontrado para os filtros aplicados.
          </p>
        </div>
      ) : (
        <LeadsTable leads={leads} members={members} />
      )}
    </div>
  )
}

export default function LeadsPage(props: PageProps) {
  return (
    <Suspense fallback={<LeadsSkeleton />}>
      <LeadsContent {...props} />
    </Suspense>
  )
}
