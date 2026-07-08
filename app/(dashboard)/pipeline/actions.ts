'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getActiveWorkspaceContext } from '@/lib/supabase/workspace-context'
import type { DealStage } from '@/types'

export interface DealActionResult {
  error?: string
  id?: string
}

export interface DealInput {
  title: string
  value: string
  lead_id: string
  assigned_to: string
  stage: DealStage
  deadline: string
}

function parseValue(value: string): number {
  return parseFloat(value.replace(',', '.')) || 0
}

function parseDeadline(deadline: string): string | null {
  return deadline ? `${deadline}T00:00:00Z` : null
}

export async function createDeal(data: DealInput): Promise<DealActionResult> {
  const supabase = await createClient()
  const context = await getActiveWorkspaceContext(supabase)
  if (!context) return { error: 'Sessão expirada. Faça login novamente.' }

  const { count } = await supabase
    .from('deals')
    .select('*', { count: 'exact', head: true })
    .eq('workspace_id', context.workspaceId)
    .eq('stage', data.stage)

  const { data: deal, error } = await supabase
    .from('deals')
    .insert({
      workspace_id: context.workspaceId,
      title: data.title.trim(),
      value: parseValue(data.value),
      stage: data.stage,
      lead_id: data.lead_id || null,
      assigned_to: data.assigned_to || null,
      deadline: parseDeadline(data.deadline),
      position: count ?? 0,
    })
    .select('id')
    .single()

  if (error || !deal) {
    return { error: 'Não foi possível criar o negócio. Tente novamente.' }
  }

  revalidatePath('/pipeline')
  revalidatePath('/dashboard')
  return { id: deal.id }
}

export async function updateDeal(dealId: string, data: DealInput): Promise<DealActionResult> {
  const supabase = await createClient()
  const context = await getActiveWorkspaceContext(supabase)
  if (!context) return { error: 'Sessão expirada. Faça login novamente.' }

  const { error } = await supabase
    .from('deals')
    .update({
      title: data.title.trim(),
      value: parseValue(data.value),
      stage: data.stage,
      lead_id: data.lead_id || null,
      assigned_to: data.assigned_to || null,
      deadline: parseDeadline(data.deadline),
    })
    .eq('id', dealId)
    .eq('workspace_id', context.workspaceId)

  if (error) {
    return { error: 'Não foi possível salvar as alterações. Tente novamente.' }
  }

  revalidatePath('/pipeline')
  revalidatePath('/dashboard')
  return {}
}

export async function deleteDeal(dealId: string): Promise<DealActionResult> {
  const supabase = await createClient()
  const context = await getActiveWorkspaceContext(supabase)
  if (!context) return { error: 'Sessão expirada. Faça login novamente.' }

  const { error } = await supabase
    .from('deals')
    .delete()
    .eq('id', dealId)
    .eq('workspace_id', context.workspaceId)

  if (error) {
    return { error: 'Não foi possível excluir o negócio. Tente novamente.' }
  }

  revalidatePath('/pipeline')
  revalidatePath('/dashboard')
  return {}
}

export interface DealPositionUpdate {
  id: string
  stage: DealStage
  position: number
}

export async function updateDealStage(updates: DealPositionUpdate[]): Promise<DealActionResult> {
  const supabase = await createClient()
  const context = await getActiveWorkspaceContext(supabase)
  if (!context) return { error: 'Sessão expirada. Faça login novamente.' }

  const results = await Promise.all(
    updates.map(({ id, stage, position }) =>
      supabase
        .from('deals')
        .update({ stage, position })
        .eq('id', id)
        .eq('workspace_id', context.workspaceId)
    )
  )

  if (results.some((r) => r.error)) {
    return { error: 'Não foi possível salvar a nova posição. Tente novamente.' }
  }

  revalidatePath('/pipeline')
  revalidatePath('/dashboard')
  return {}
}
