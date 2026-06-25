// Resend email templates — implemented in M8
export type InviteEmailProps = {
  workspaceName: string
  inviteUrl: string
  inviterEmail: string
}

export function buildInviteEmail(_props: InviteEmailProps): string {
  return ''
}
