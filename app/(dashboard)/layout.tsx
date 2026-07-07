import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserWorkspaces } from '@/lib/supabase/queries'
import { DashboardShell } from '@/components/shared/dashboard-shell'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const workspaces = await getUserWorkspaces(supabase, user.id)

  if (workspaces.length === 0) {
    redirect('/onboarding')
  }

  const cookieStore = await cookies()
  const cookieWorkspaceId = cookieStore.get('active_workspace_id')?.value
  const activeWorkspaceId = workspaces.some((w) => w.id === cookieWorkspaceId)
    ? cookieWorkspaceId!
    : workspaces[0].id

  return (
    <DashboardShell
      workspaces={workspaces}
      activeWorkspaceId={activeWorkspaceId}
      user={{
        name: (user.user_metadata?.full_name as string | undefined) ?? user.email ?? 'Usuário',
        email: user.email ?? '',
      }}
    >
      {children}
    </DashboardShell>
  )
}
