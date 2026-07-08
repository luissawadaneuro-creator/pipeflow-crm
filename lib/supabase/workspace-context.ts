import { cookies } from 'next/headers'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

export const ACTIVE_WORKSPACE_COOKIE = 'active_workspace_id'

export interface WorkspaceContext {
  userId: string
  workspaceId: string
}

export async function getActiveWorkspaceContext(
  supabase: SupabaseClient<Database>
): Promise<WorkspaceContext | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const cookieStore = await cookies()
  const workspaceId = cookieStore.get(ACTIVE_WORKSPACE_COOKIE)?.value

  if (!workspaceId) return null

  return { userId: user.id, workspaceId }
}
