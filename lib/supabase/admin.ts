import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

// Service-role client — bypasses RLS. Only for server-side flows where the
// acting user isn't necessarily a workspace member yet (e.g. invite acceptance
// before the workspace_members row exists).
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
