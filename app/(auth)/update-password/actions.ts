'use server'

import { createClient } from '@/lib/supabase/server'

export interface UpdatePasswordResult {
  error?: string
}

export async function updatePassword(password: string): Promise<UpdatePasswordResult> {
  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { error: 'Não foi possível atualizar a senha. O link pode ter expirado.' }
  }

  return {}
}
