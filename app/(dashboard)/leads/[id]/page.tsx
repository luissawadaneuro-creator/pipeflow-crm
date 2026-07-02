'use client'

import { useState } from 'react'
import { use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Pencil, Trash2, Plus, KanbanSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { LeadProfile } from '@/components/leads/lead-profile'
import { ActivityTimeline } from '@/components/leads/activity-timeline'
import { LeadForm } from '@/components/leads/lead-form'
import { MOCK_LEADS, MOCK_ACTIVITIES } from '@/lib/mock-leads'
import type { Lead } from '@/types'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function LeadDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()

  const initial = MOCK_LEADS.find((l) => l.id === id) ?? null
  const [lead, setLead] = useState<Lead | null>(initial)
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const activities = MOCK_ACTIVITIES.filter((a) => a.lead_id === id)

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">Lead não encontrado.</p>
        <Button variant="outline" onClick={() => router.push('/leads')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Leads
        </Button>
      </div>
    )
  }

  function handleSave(data: Parameters<typeof LeadForm>[0]['onSave'] extends (d: infer D) => void ? D : never) {
    setLead((prev) =>
      prev ? { ...prev, ...data, updated_at: new Date().toISOString() } : prev
    )
    setEditing(false)
  }

  async function handleDelete() {
    setDeleting(true)
    await new Promise((r) => setTimeout(r, 600))
    router.push('/leads')
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back + actions */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => router.push('/leads')}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Leads
        </button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Pencil className="w-3.5 h-3.5 mr-1.5" />
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Excluir
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: profile */}
        <div className="lg:col-span-1 space-y-4">
          <LeadProfile lead={lead} />

          {/* Deals placeholder */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                <KanbanSquare className="w-4 h-4 text-muted-foreground" />
                Negócios
              </h3>
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground" disabled>
                <Plus className="w-3 h-3" />
                Adicionar
              </Button>
            </div>
            <div className="rounded-lg border border-dashed border-border p-4 text-center">
              <p className="text-xs text-muted-foreground">
                Negócios disponíveis no M5 — Pipeline
              </p>
            </div>
          </div>
        </div>

        {/* Right: activity timeline */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">Atividades</h3>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5" disabled>
              <Plus className="w-3 h-3" />
              Registrar atividade
            </Button>
          </div>
          <ActivityTimeline activities={activities} />
          {activities.length === 0 && (
            <p className="text-xs text-muted-foreground text-center">
              Registro de atividades disponível no M6.
            </p>
          )}
        </div>
      </div>

      {/* Edit dialog */}
      <LeadForm
        open={editing}
        onClose={() => setEditing(false)}
        onSave={handleSave}
        lead={lead}
      />

      {/* Delete confirm */}
      <Dialog open={confirmDelete} onOpenChange={(v) => { if (!v) setConfirmDelete(false) }}>
        <DialogContent className="sm:max-w-sm bg-card border-border">
          <DialogHeader>
            <DialogTitle>Excluir lead</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja excluir{' '}
            <span className="font-medium text-foreground">{lead.name}</span>?
            Esta ação não pode ser desfeita.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)} disabled={deleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Excluindo…' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
