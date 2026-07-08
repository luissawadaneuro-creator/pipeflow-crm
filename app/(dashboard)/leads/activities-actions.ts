'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getActiveWorkspaceContext } from '@/lib/supabase/workspace-context'
import type { ActivityType } from '@/types'

export interface ActivityActionResult {
  error?: string
  id?: string
}

export interface ActivityInput {
  leadId: string
  type: ActivityType
  description: string
  date: string
}

export async function createActivity(data: ActivityInput): Promise<ActivityActionResult> {
  const supabase = await createClient()
  const context = await getActiveWorkspaceContext(supabase)
  if (!context) return { error: 'Sessão expirada. Faça login novamente.' }

  if (!data.description.trim()) {
    return { error: 'Descrição obrigatória.' }
  }

  const { data: activity, error } = await supabase
    .from('activities')
    .insert({
      workspace_id: context.workspaceId,
      lead_id: data.leadId,
      author_id: context.userId,
      type: data.type,
      description: data.description.trim(),
      activity_date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
    })
    .select('id')
    .single()

  if (error || !activity) {
    return { error: 'Não foi possível registrar a atividade. Tente novamente.' }
  }

  revalidatePath(`/leads/${data.leadId}`)
  return { id: activity.id }
}
