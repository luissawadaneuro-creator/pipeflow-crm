import { redirect } from 'next/navigation'
import { KanbanBoard } from '@/components/pipeline/kanban-board'
import { createClient } from '@/lib/supabase/server'
import { getActiveWorkspaceContext } from '@/lib/supabase/workspace-context'
import { getDeals, getLeads, getWorkspaceMembers } from '@/lib/supabase/queries'

export default async function PipelinePage() {
  const supabase = await createClient()
  const context = await getActiveWorkspaceContext(supabase)
  if (!context) redirect('/login')

  const [deals, leads, members] = await Promise.all([
    getDeals(supabase, context.workspaceId),
    getLeads(supabase, context.workspaceId),
    getWorkspaceMembers(supabase, context.workspaceId),
  ])

  return (
    <div className="flex flex-col h-full min-h-0 gap-4">
      {/* Header */}
      <div className="flex items-start justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Pipeline</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Arraste os cards para mover negócios entre as etapas.
          </p>
        </div>
      </div>

      {/* Board — takes remaining vertical space */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <KanbanBoard initialDeals={deals} leads={leads} members={members} />
      </div>
    </div>
  )
}
