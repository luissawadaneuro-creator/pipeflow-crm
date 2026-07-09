import { InviteAcceptCard } from '@/components/invites/invite-accept-card'

interface PageProps {
  params: Promise<{ token: string }>
}

export default async function InvitePage({ params }: PageProps) {
  const { token } = await params

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <InviteAcceptCard token={token} />
    </div>
  )
}
