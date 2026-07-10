import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getActiveWorkspaceContext } from '@/lib/supabase/workspace-context'
import { getWorkspaceMembers } from '@/lib/supabase/queries'
import { FREE_PLAN_MEMBER_LIMIT, FREE_PLAN_LEAD_LIMIT } from '@/lib/limits'
import { PlanCard } from '@/components/settings/plan-card'
import { PricingComparison } from '@/components/settings/pricing-comparison'

export default async function BillingPage() {
  const supabase = await createClient()
  const context = await getActiveWorkspaceContext(supabase)
  if (!context) redirect('/login')

  const [{ data: workspace }, members, { count: leadCount }] = await Promise.all([
    supabase
      .from('workspaces')
      .select('plan, plan_status, stripe_customer_id')
      .eq('id', context.workspaceId)
      .single(),
    getWorkspaceMembers(supabase, context.workspaceId),
    supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('workspace_id', context.workspaceId),
  ])

  if (!workspace) redirect('/dashboard')

  const currentMember = members.find((m) => m.user_id === context.userId)
  const isAdmin = currentMember?.role === 'admin'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Cobrança</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Gerencie o plano e a assinatura do workspace.
        </p>
      </div>

      <PlanCard
        plan={workspace.plan}
        planStatus={workspace.plan_status}
        hasStripeCustomer={!!workspace.stripe_customer_id}
        isAdmin={isAdmin}
        memberCount={members.length}
        memberLimit={FREE_PLAN_MEMBER_LIMIT}
        leadCount={leadCount ?? 0}
        leadLimit={FREE_PLAN_LEAD_LIMIT}
      />

      <PricingComparison currentPlan={workspace.plan} />
    </div>
  )
}
