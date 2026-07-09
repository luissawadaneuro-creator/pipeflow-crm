'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getActiveWorkspaceContext } from '@/lib/supabase/workspace-context'
import { countWorkspaceSeats } from '@/lib/supabase/queries'
import { resend } from '@/lib/resend/client'
import { buildInviteEmail } from '@/lib/resend/emails'
import type { WorkspaceRole } from '@/types'

const FREE_PLAN_MEMBER_LIMIT = 2

export interface MemberActionResult {
  error?: string
}

export async function sendInvite(email: string, role: WorkspaceRole): Promise<MemberActionResult> {
  const supabase = await createClient()
  const context = await getActiveWorkspaceContext(supabase)
  if (!context) return { error: 'Sessão expirada. Faça login novamente.' }

  const normalizedEmail = email.trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return { error: 'E-mail inválido.' }
  }

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id, name, plan')
    .eq('id', context.workspaceId)
    .single()

  if (!workspace) return { error: 'Workspace não encontrado.' }

  if (workspace.plan === 'free') {
    const seats = await countWorkspaceSeats(supabase, context.workspaceId)
    if (seats >= FREE_PLAN_MEMBER_LIMIT) {
      return {
        error: `O plano Free permite no máximo ${FREE_PLAN_MEMBER_LIMIT} membros. Faça upgrade para o plano Pro para convidar mais pessoas.`,
      }
    }
  }

  const { data: existingInvite } = await supabase
    .from('workspace_invites')
    .select('id')
    .eq('workspace_id', context.workspaceId)
    .eq('email', normalizedEmail)
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle()

  if (existingInvite) {
    return { error: 'Já existe um convite pendente para este e-mail.' }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: invite, error: inviteError } = await supabase
    .from('workspace_invites')
    .insert({
      workspace_id: context.workspaceId,
      email: normalizedEmail,
      role,
      invited_by: context.userId,
    })
    .select('token')
    .single()

  if (inviteError || !invite) {
    return { error: 'Não foi possível criar o convite. Tente novamente.' }
  }

  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${invite.token}`

  const { error: sendError } = await resend.emails.send({
    from: 'PipeFlow <onboarding@resend.dev>',
    to: normalizedEmail,
    subject: `Você foi convidado para o ${workspace.name}`,
    html: buildInviteEmail({
      workspaceName: workspace.name,
      inviteUrl,
      inviterEmail: user?.email ?? '',
    }),
  }).catch((err) => ({ error: err }))

  if (sendError) {
    console.error('[sendInvite] Resend error:', sendError)
    return { error: 'Convite criado, mas houve um erro ao enviar o e-mail.' }
  }

  revalidatePath('/settings/members')
  return {}
}

export async function revokeInvite(inviteId: string): Promise<MemberActionResult> {
  const supabase = await createClient()
  const context = await getActiveWorkspaceContext(supabase)
  if (!context) return { error: 'Sessão expirada. Faça login novamente.' }

  const { error } = await supabase
    .from('workspace_invites')
    .delete()
    .eq('id', inviteId)
    .eq('workspace_id', context.workspaceId)

  if (error) return { error: 'Não foi possível cancelar o convite.' }

  revalidatePath('/settings/members')
  return {}
}

export async function updateMemberRole(
  userId: string,
  role: WorkspaceRole
): Promise<MemberActionResult> {
  const supabase = await createClient()
  const context = await getActiveWorkspaceContext(supabase)
  if (!context) return { error: 'Sessão expirada. Faça login novamente.' }

  if (role === 'member' && userId === context.userId) {
    const isLastAdmin = await isOnlyAdmin(supabase, context.workspaceId, userId)
    if (isLastAdmin) {
      return { error: 'Você é o único admin do workspace e não pode remover seu próprio cargo.' }
    }
  }

  const { error } = await supabase
    .from('workspace_members')
    .update({ role })
    .eq('workspace_id', context.workspaceId)
    .eq('user_id', userId)

  if (error) return { error: 'Não foi possível atualizar o cargo do membro.' }

  revalidatePath('/settings/members')
  return {}
}

export async function removeMember(userId: string): Promise<MemberActionResult> {
  const supabase = await createClient()
  const context = await getActiveWorkspaceContext(supabase)
  if (!context) return { error: 'Sessão expirada. Faça login novamente.' }

  if (userId === context.userId) {
    const isLastAdmin = await isOnlyAdmin(supabase, context.workspaceId, userId)
    if (isLastAdmin) {
      return { error: 'Você é o único admin do workspace e não pode se remover.' }
    }
  }

  const { error } = await supabase
    .from('workspace_members')
    .delete()
    .eq('workspace_id', context.workspaceId)
    .eq('user_id', userId)

  if (error) return { error: 'Não foi possível remover o membro.' }

  revalidatePath('/settings/members')
  return {}
}

async function isOnlyAdmin(
  supabase: Awaited<ReturnType<typeof createClient>>,
  workspaceId: string,
  userId: string
): Promise<boolean> {
  const { data } = await supabase
    .from('workspace_members')
    .select('user_id, role')
    .eq('workspace_id', workspaceId)
    .eq('role', 'admin')

  const admins = data ?? []
  return admins.length === 1 && admins[0].user_id === userId
}
