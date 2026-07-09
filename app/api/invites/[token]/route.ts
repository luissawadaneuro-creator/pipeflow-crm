import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const FREE_PLAN_MEMBER_LIMIT = 2

export async function GET(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const admin = createAdminClient()

  const { data: invite } = await admin
    .from('workspace_invites')
    .select('id, workspace_id, email, role, accepted_at, expires_at, workspaces(name, plan)')
    .eq('token', token)
    .maybeSingle()

  if (!invite) {
    return NextResponse.json({ error: 'Convite não encontrado.' }, { status: 404 })
  }
  if (invite.accepted_at) {
    return NextResponse.json({ error: 'Este convite já foi aceito.' }, { status: 410 })
  }
  if (new Date(invite.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Este convite expirou.' }, { status: 410 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({
      requiresAuth: true,
      workspaceName: (invite.workspaces as unknown as { name: string } | null)?.name ?? '',
      email: invite.email,
    })
  }

  if (user.email?.toLowerCase() !== invite.email.toLowerCase()) {
    return NextResponse.json(
      { error: 'Este convite foi enviado para outro e-mail. Entre com a conta correta.' },
      { status: 403 }
    )
  }

  const workspace = invite.workspaces as unknown as { name: string; plan: string } | null

  if (workspace?.plan === 'free') {
    const { data: seats } = await admin.rpc('count_workspace_seats', {
      p_workspace_id: invite.workspace_id,
    })
    // This invite is already counted as an occupied seat by count_workspace_seats;
    // accepting it converts that seat into a member rather than adding a new one.
    if ((seats ?? 0) > FREE_PLAN_MEMBER_LIMIT) {
      return NextResponse.json(
        { error: 'Este workspace atingiu o limite de membros do plano Free.' },
        { status: 409 }
      )
    }
  }

  const { error: memberError } = await admin
    .from('workspace_members')
    .upsert(
      { workspace_id: invite.workspace_id, user_id: user.id, role: invite.role },
      { onConflict: 'workspace_id,user_id', ignoreDuplicates: true }
    )

  if (memberError) {
    return NextResponse.json({ error: 'Não foi possível adicionar você ao workspace.' }, { status: 500 })
  }

  await admin
    .from('workspace_invites')
    .update({ accepted_at: new Date().toISOString() })
    .eq('id', invite.id)

  return NextResponse.json({ success: true, workspaceId: invite.workspace_id })
}
