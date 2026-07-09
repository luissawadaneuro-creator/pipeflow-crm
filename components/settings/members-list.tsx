'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, ShieldCheck, UserMinus, Mail, X } from 'lucide-react'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { updateMemberRole, removeMember, revokeInvite } from '@/app/(dashboard)/settings/members/actions'
import type { Member, WorkspaceInvite } from '@/types'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function initials(label: string) {
  return label
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

interface MembersListProps {
  members: Member[]
  invites: WorkspaceInvite[]
  currentUserId: string
  isAdmin: boolean
}

export function MembersList({ members, invites, currentUserId, isAdmin }: MembersListProps) {
  const router = useRouter()
  const [removingMember, setRemovingMember] = useState<Member | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  async function handleRoleChange(userId: string, role: 'admin' | 'member') {
    setBusyId(userId)
    const result = await updateMemberRole(userId, role)
    setBusyId(null)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('Cargo atualizado.')
    router.refresh()
  }

  async function handleRemove() {
    if (!removingMember) return
    setBusyId(removingMember.user_id)
    const result = await removeMember(removingMember.user_id)
    setBusyId(null)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('Membro removido.')
    setRemovingMember(null)
    router.refresh()
  }

  async function handleRevoke(inviteId: string) {
    setBusyId(inviteId)
    const result = await revokeInvite(inviteId)
    setBusyId(null)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('Convite cancelado.')
    router.refresh()
  }

  return (
    <>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nome</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">E-mail</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Cargo</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">Desde</th>
                {isAdmin && <th className="px-4 py-3 w-10" />}
              </tr>
            </thead>
            <tbody>
              {members.map((member) => {
                const label = member.full_name || member.email || member.user_id
                const isSelf = member.user_id === currentUserId
                return (
                  <tr key={member.user_id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-bold text-primary">{initials(label)}</span>
                        </div>
                        <p className="font-medium text-foreground">
                          {label} {isSelf && <span className="text-xs text-muted-foreground">(você)</span>}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{member.email ?? '—'}</td>
                    <td className="px-4 py-3">
                      <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                        {member.role === 'admin' ? 'Admin' : 'Membro'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                      {member.created_at ? formatDate(member.created_at) : '—'}
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            className="inline-flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors focus:outline-none disabled:opacity-50"
                            disabled={busyId === member.user_id}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 bg-popover border-border">
                            {member.role === 'member' ? (
                              <DropdownMenuItem
                                className="cursor-pointer text-sm gap-2"
                                onClick={() => handleRoleChange(member.user_id, 'admin')}
                              >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                Tornar admin
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                className="cursor-pointer text-sm gap-2"
                                onClick={() => handleRoleChange(member.user_id, 'member')}
                              >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                Tornar membro
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="cursor-pointer text-sm gap-2 text-destructive focus:text-destructive"
                              onClick={() => setRemovingMember(member)}
                            >
                              <UserMinus className="w-3.5 h-3.5" />
                              Remover
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    )}
                  </tr>
                )
              })}

              {invites.map((invite) => (
                <tr key={invite.id} className="border-b border-border last:border-0 bg-secondary/10">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                      <p className="font-medium text-muted-foreground">{invite.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{invite.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="text-muted-foreground">
                      Convite pendente
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                    {formatDate(invite.created_at)}
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRevoke(invite.id)}
                        disabled={busyId === invite.id}
                        title="Cancelar convite"
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!removingMember} onOpenChange={(v) => { if (!v) setRemovingMember(null) }}>
        <DialogContent className="sm:max-w-sm bg-card border-border">
          <DialogHeader>
            <DialogTitle>Remover membro</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja remover{' '}
            <span className="font-medium text-foreground">
              {removingMember?.full_name || removingMember?.email}
            </span>{' '}
            do workspace?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemovingMember(null)} disabled={busyId === removingMember?.user_id}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleRemove} disabled={busyId === removingMember?.user_id}>
              {busyId === removingMember?.user_id ? 'Removendo…' : 'Remover'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
