import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'
import type { Workspace } from '@/types'

export async function getUserWorkspaces(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<Pick<Workspace, 'id' | 'name' | 'slug' | 'plan'>[]> {
  const { data, error } = await supabase.rpc('get_user_workspaces', { p_user_id: userId })

  if (error || !data) return []

  return data.map((w) => ({ id: w.id, name: w.name, slug: w.slug, plan: w.plan }))
}
