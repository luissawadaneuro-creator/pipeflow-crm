'use server'

import { createClient } from '@/lib/supabase/server'

export interface SignupResult {
  error?: string
}

export async function signUp(name: string, email: string, password: string): Promise<SignupResult> {
  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (error) {
    if (error.message.toLowerCase().includes('already registered')) {
      return { error: 'Este e-mail já está cadastrado.' }
    }
    if (error.code === 'over_email_send_rate_limit') {
      return { error: 'Muitas tentativas de cadastro. Aguarde alguns minutos e tente novamente.' }
    }
    return { error: 'Não foi possível criar a conta. Tente novamente.' }
  }

  return {}
}
