'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ACTIVE_WORKSPACE_COOKIE } from '@/lib/supabase/workspace-context'

export interface CreateWorkspaceResult {
  error?: string
}

export async function createWorkspace(name: string): Promise<CreateWorkspaceResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Sessão expirada. Faça login novamente.' }
  }

  const slug = name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .concat(`-${Math.random().toString(36).slice(2, 7)}`)

  const { data: workspace, error: workspaceError } = await supabase
    .from('workspaces')
    .insert({ name: name.trim(), slug, owner_id: user.id })
    .select('id')
    .single()

  if (workspaceError || !workspace) {
    return { error: 'Não foi possível criar o workspace. Tente novamente.' }
  }

  const { error: memberError } = await supabase
    .from('workspace_members')
    .insert({ workspace_id: workspace.id, user_id: user.id, role: 'admin' })

  if (memberError) {
    return { error: 'Workspace criado, mas houve um erro ao vincular seu usuário.' }
  }

  const cookieStore = await cookies()
  cookieStore.set(ACTIVE_WORKSPACE_COOKIE, workspace.id, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  })

  redirect('/dashboard')
}

export async function switchWorkspace(workspaceId: string) {
  const cookieStore = await cookies()
  cookieStore.set(ACTIVE_WORKSPACE_COOKIE, workspaceId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  })
  redirect('/dashboard')
}
