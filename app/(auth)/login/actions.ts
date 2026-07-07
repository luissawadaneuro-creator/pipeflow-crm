'use server'

import { createClient } from '@/lib/supabase/server'

export interface LoginResult {
  error?: string
}

export async function loginWithPassword(email: string, password: string): Promise<LoginResult> {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    if (error.message.toLowerCase().includes('invalid login credentials')) {
      return { error: 'E-mail ou senha incorretos.' }
    }
    return { error: 'Não foi possível entrar. Tente novamente.' }
  }

  return {}
}
