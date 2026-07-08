'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, Pencil, Trash2, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { LeadStatusBadge } from '@/components/leads/lead-status-badge'
import { LeadForm, type LeadFormFields } from '@/components/leads/lead-form'
import { updateLead, deleteLead } from '@/app/(dashboard)/leads/actions'
import type { Lead, Member } from '@/types'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

interface LeadsTableProps {
  leads: Lead[]
  members: Member[]
}

export function LeadsTable({ leads, members }: LeadsTableProps) {
  const router = useRouter()
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [deletingLead, setDeletingLead] = useState<Lead | null>(null)
  const [deleting, setDeleting] = useState(false)

  function memberLabel(userId: string | null) {
    if (!userId) return null
    const member = members.find((m) => m.user_id === userId)
    return member?.full_name || member?.email || userId
  }

  async function handleSave(data: LeadFormFields) {
    const result = await updateLead(editingLead!.id, data)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('Lead atualizado com sucesso.')
    setEditingLead(null)
    router.refresh()
  }

  async function handleDelete() {
    setDeleting(true)
    const result = await deleteLead(deletingLead!.id)
    setDeleting(false)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('Lead excluído com sucesso.')
    setDeletingLead(null)
    router.refresh()
  }

  if (leads.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <p className="text-muted-foreground text-sm">Nenhum lead encontrado.</p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nome</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Empresa</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">E-mail</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">Responsável</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">Criado em</th>
                <th className="px-4 py-3 w-10" />
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr
                  key={lead.id}
                  className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors cursor-pointer"
                  onClick={() => router.push(`/leads/${lead.id}`)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold text-primary">{initials(lead.name)}</span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{lead.name}</p>
                        {lead.role && (
                          <p className="text-xs text-muted-foreground">{lead.role}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{lead.company ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                    {lead.email ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <LeadStatusBadge status={lead.status} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                    {memberLabel(lead.assigned_to) ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                    {formatDate(lead.created_at)}
                  </td>
                  <td
                    className="px-4 py-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors focus:outline-none">
                        <MoreHorizontal className="w-4 h-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44 bg-popover border-border">
                        <DropdownMenuGroup>
                          <DropdownMenuItem
                            className="cursor-pointer text-sm gap-2"
                            onClick={() => router.push(`/leads/${lead.id}`)}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Ver detalhe
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer text-sm gap-2"
                            onClick={() => setEditingLead(lead)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            Editar
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator className="bg-border" />
                        <DropdownMenuGroup>
                          <DropdownMenuItem
                            className="cursor-pointer text-sm gap-2 text-destructive focus:text-destructive"
                            onClick={() => setDeletingLead(lead)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit dialog */}
      <LeadForm
        open={!!editingLead}
        onClose={() => setEditingLead(null)}
        onSave={handleSave}
        lead={editingLead}
        members={members}
      />

      {/* Delete confirm dialog */}
      <Dialog open={!!deletingLead} onOpenChange={(v) => { if (!v) setDeletingLead(null) }}>
        <DialogContent className="sm:max-w-sm bg-card border-border">
          <DialogHeader>
            <DialogTitle>Excluir lead</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja excluir{' '}
            <span className="font-medium text-foreground">{deletingLead?.name}</span>?
            Esta ação não pode ser desfeita.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingLead(null)} disabled={deleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Excluindo…' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
