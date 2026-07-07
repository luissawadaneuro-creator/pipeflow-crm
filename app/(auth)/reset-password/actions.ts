'use server'

import { createClient } from '@/lib/supabase/server'

export interface ResetPasswordResult {
  error?: string
}

export async function resetPassword(email: string): Promise<ResetPasswordResult> {
  const supabase = await createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/update-password`,
  })

  // Don't leak whether the email exists — always report success to the UI.
  if (error) {
    return {}
  }

  return {}
}
