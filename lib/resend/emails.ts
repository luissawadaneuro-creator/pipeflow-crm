export type InviteEmailProps = {
  workspaceName: string
  inviteUrl: string
  inviterEmail: string
}

export function buildInviteEmail({ workspaceName, inviteUrl, inviterEmail }: InviteEmailProps): string {
  return `
    <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #0f172a;">
      <h1 style="font-size: 20px; font-weight: 600; margin: 0 0 16px;">Você foi convidado para o ${workspaceName}</h1>
      <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 24px;">
        ${inviterEmail} convidou você para colaborar no workspace <strong>${workspaceName}</strong> no PipeFlow CRM.
      </p>
      <a href="${inviteUrl}" style="display: inline-block; background: #2563eb; color: #fff; text-decoration: none; font-size: 14px; font-weight: 500; padding: 10px 20px; border-radius: 8px;">
        Aceitar convite
      </a>
      <p style="font-size: 12px; line-height: 1.6; color: #94a3b8; margin: 24px 0 0;">
        Este convite expira em 7 dias. Se você não esperava este e-mail, pode ignorá-lo.
      </p>
    </div>
  `.trim()
}
