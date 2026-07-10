'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getActiveWorkspaceContext } from '@/lib/supabase/workspace-context'
import { canAddLead, FREE_PLAN_LEAD_LIMIT } from '@/lib/limits'
import type { LeadStatus } from '@/types'

export interface LeadActionResult {
  error?: string
  id?: string
}

export interface LeadInput {
  name: string
  email: string
  phone: string
  company: string
  role: string
  status: LeadStatus
  assigned_to: string
}

export async function createLead(data: LeadInput): Promise<LeadActionResult> {
  const supabase = await createClient()
  const context = await getActiveWorkspaceContext(supabase)
  if (!context) return { error: 'Sessão expirada. Faça login novamente.' }

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('plan')
    .eq('id', context.workspaceId)
    .single()

  if (!workspace) return { error: 'Workspace não encontrado.' }

  const leadLimit = await canAddLead(supabase, context.workspaceId, workspace.plan)
  if (!leadLimit.allowed) {
    return {
      error: `O plano Free permite no máximo ${FREE_PLAN_LEAD_LIMIT} leads. Faça upgrade para o plano Pro para adicionar mais.`,
    }
  }

  const { data: lead, error } = await supabase
    .from('leads')
    .insert({
      workspace_id: context.workspaceId,
      name: data.name.trim(),
      email: data.email || null,
      phone: data.phone || null,
      company: data.company || null,
      role: data.role || null,
      status: data.status,
      assigned_to: data.assigned_to || null,
    })
    .select('id')
    .single()

  if (error || !lead) {
    return { error: 'Não foi possível criar o lead. Tente novamente.' }
  }

  revalidatePath('/leads')
  return { id: lead.id }
}

export async function updateLead(leadId: string, data: LeadInput): Promise<LeadActionResult> {
  const supabase = await createClient()
  const context = await getActiveWorkspaceContext(supabase)
  if (!context) return { error: 'Sessão expirada. Faça login novamente.' }

  const { error } = await supabase
    .from('leads')
    .update({
      name: data.name.trim(),
      email: data.email || null,
      phone: data.phone || null,
      company: data.company || null,
      role: data.role || null,
      status: data.status,
      assigned_to: data.assigned_to || null,
    })
    .eq('id', leadId)
    .eq('workspace_id', context.workspaceId)

  if (error) {
    return { error: 'Não foi possível salvar as alterações. Tente novamente.' }
  }

  revalidatePath('/leads')
  revalidatePath(`/leads/${leadId}`)
  return {}
}

export async function deleteLead(leadId: string): Promise<LeadActionResult> {
  const supabase = await createClient()
  const context = await getActiveWorkspaceContext(supabase)
  if (!context) return { error: 'Sessão expirada. Faça login novamente.' }

  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', leadId)
    .eq('workspace_id', context.workspaceId)

  if (error) {
    return { error: 'Não foi possível excluir o lead. Tente novamente.' }
  }

  revalidatePath('/leads')
  return {}
}
