import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'
import type { WorkspacePlan } from '@/types'
import { countWorkspaceSeats } from '@/lib/supabase/queries'

export const FREE_PLAN_MEMBER_LIMIT = 2
export const FREE_PLAN_LEAD_LIMIT = 50

export interface LimitCheck {
  allowed: boolean
  limit: number
  current: number
}

export async function canAddMember(
  supabase: SupabaseClient<Database>,
  workspaceId: string,
  plan: WorkspacePlan
): Promise<LimitCheck> {
  if (plan !== 'free') {
    return { allowed: true, limit: Infinity, current: 0 }
  }

  const seats = await countWorkspaceSeats(supabase, workspaceId)
  return { allowed: seats < FREE_PLAN_MEMBER_LIMIT, limit: FREE_PLAN_MEMBER_LIMIT, current: seats }
}

export async function canAddLead(
  supabase: SupabaseClient<Database>,
  workspaceId: string,
  plan: WorkspacePlan
): Promise<LimitCheck> {
  if (plan !== 'free') {
    return { allowed: true, limit: Infinity, current: 0 }
  }

  const { count } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('workspace_id', workspaceId)

  const current = count ?? 0
  return { allowed: current < FREE_PLAN_LEAD_LIMIT, limit: FREE_PLAN_LEAD_LIMIT, current }
}
