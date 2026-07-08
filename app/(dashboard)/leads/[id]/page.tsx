import { notFound, redirect } from 'next/navigation'
import { ArrowLeft, KanbanSquare } from 'lucide-react'
import Link from 'next/link'
import { LeadProfile } from '@/components/leads/lead-profile'
import { ActivityTimeline } from '@/components/leads/activity-timeline'
import { LeadDetailActions } from '@/components/leads/lead-detail-actions'
import { createClient } from '@/lib/supabase/server'
import { getActiveWorkspaceContext } from '@/lib/supabase/workspace-context'
import { getLead, getWorkspaceMembers } from '@/lib/supabase/queries'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function LeadDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const context = await getActiveWorkspaceContext(supabase)
  if (!context) redirect('/login')

  const [lead, members] = await Promise.all([
    getLead(supabase, context.workspaceId, id),
    getWorkspaceMembers(supabase, context.workspaceId),
  ])

  if (!lead) notFound()

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back + actions */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/leads"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Leads
        </Link>
        <LeadDetailActions lead={lead} members={members} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: profile */}
        <div className="lg:col-span-1 space-y-4">
          <LeadProfile lead={lead} members={members} />

          {/* Deals placeholder */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                <KanbanSquare className="w-4 h-4 text-muted-foreground" />
                Negócios
              </h3>
            </div>
            <div className="rounded-lg border border-dashed border-border p-4 text-center">
              <p className="text-xs text-muted-foreground">
                Veja os negócios vinculados a este lead no Pipeline.
              </p>
            </div>
          </div>
        </div>

        {/* Right: activity timeline */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">Atividades</h3>
          </div>
          <ActivityTimeline activities={[]} />
          <p className="text-xs text-muted-foreground text-center">
            Registro de atividades disponível no M6.
          </p>
        </div>
      </div>
    </div>
  )
}
