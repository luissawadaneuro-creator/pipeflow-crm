import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getActiveWorkspaceContext } from '@/lib/supabase/workspace-context'
import { getWorkspaceMembers, getPendingInvites } from '@/lib/supabase/queries'
import { MembersList } from '@/components/settings/members-list'
import { InviteForm } from '@/components/settings/invite-form'

const FREE_PLAN_MEMBER_LIMIT = 2

export default async function MembersPage() {
  const supabase = await createClient()
  const context = await getActiveWorkspaceContext(supabase)
  if (!context) redirect('/login')

  const [{ data: workspace }, members, invites] = await Promise.all([
    supabase.from('workspaces').select('plan').eq('id', context.workspaceId).single(),
    getWorkspaceMembers(supabase, context.workspaceId),
    getPendingInvites(supabase, context.workspaceId),
  ])

  const plan = workspace?.plan ?? 'free'
  const seatsUsed = members.length + invites.length
  const currentMember = members.find((m) => m.user_id === context.userId)
  const isAdmin = currentMember?.role === 'admin'

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Membros</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {plan === 'free'
              ? `${seatsUsed} de ${FREE_PLAN_MEMBER_LIMIT} vagas usadas no plano Free`
              : `${members.length} membros no workspace`}
          </p>
        </div>
        {isAdmin && (
          <InviteForm
            disabled={plan === 'free' && seatsUsed >= FREE_PLAN_MEMBER_LIMIT}
          />
        )}
      </div>

      <MembersList
        members={members}
        invites={invites}
        currentUserId={context.userId}
        isAdmin={isAdmin}
      />
    </div>
  )
}
