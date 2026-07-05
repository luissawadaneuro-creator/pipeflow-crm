'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MOCK_LEADS, MOCK_MEMBERS } from '@/lib/mock-leads'
import { STAGE_CONFIG } from '@/components/pipeline/kanban-column'
import type { Deal, DealStage } from '@/types'

interface FormFields {
  title: string
  value: string
  lead_id: string
  assigned_to: string
  stage: DealStage
  deadline: string
}

interface DealFormProps {
  open: boolean
  onClose: () => void
  onSave: (data: FormFields) => void
  deal?: Deal | null
  defaultStage?: DealStage
}

export function DealForm({ open, onClose, onSave, deal, defaultStage = 'new_lead' }: DealFormProps) {
  const isEditing = !!deal

  const empty: FormFields = {
    title: '',
    value: '',
    lead_id: '',
    assigned_to: MOCK_MEMBERS[0],
    stage: defaultStage,
    deadline: '',
  }

  const [fields, setFields] = useState<FormFields>(empty)
  const [errors, setErrors] = useState<{ title?: string; value?: string }>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setFields(
        deal
          ? {
              title: deal.title,
              value: deal.value > 0 ? String(deal.value) : '',
              lead_id: deal.lead_id ?? '',
              assigned_to: deal.assigned_to ?? MOCK_MEMBERS[0],
              stage: deal.stage,
              deadline: deal.deadline ? deal.deadline.slice(0, 10) : '',
            }
          : { ...empty, stage: defaultStage }
      )
      setErrors({})
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, deal, defaultStage])

  function set<K extends keyof FormFields>(key: K, value: FormFields[K]) {
    setFields(prev => ({ ...prev, [key]: value }))
    if (key in errors) setErrors(prev => ({ ...prev, [key]: undefined }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs: typeof errors = {}
    if (!fields.title.trim()) errs.title = 'Título obrigatório'
    if (fields.value && isNaN(Number(fields.value.replace(',', '.')))) {
      errs.value = 'Valor inválido'
    }
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    setLoading(false)
    onSave(fields)
  }

  const stageEntries = Object.entries(STAGE_CONFIG) as [DealStage, typeof STAGE_CONFIG[DealStage]][]

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose() }}>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar negócio' : 'Novo negócio'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            {/* Título */}
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="df-title">Título *</Label>
              <Input
                id="df-title"
                value={fields.title}
                onChange={e => set('title', e.target.value)}
                placeholder="Ex: Proposta CRM Pro — Empresa X"
                disabled={loading}
                className={errors.title ? 'border-destructive' : ''}
              />
              {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
            </div>

            {/* Valor */}
            <div className="space-y-1.5">
              <Label htmlFor="df-value">Valor (R$)</Label>
              <Input
                id="df-value"
                value={fields.value}
                onChange={e => set('value', e.target.value)}
                placeholder="4900"
                disabled={loading}
                className={errors.value ? 'border-destructive' : ''}
              />
              {errors.value && <p className="text-xs text-destructive">{errors.value}</p>}
            </div>

            {/* Prazo */}
            <div className="space-y-1.5">
              <Label htmlFor="df-deadline">Prazo</Label>
              <Input
                id="df-deadline"
                type="date"
                value={fields.deadline}
                onChange={e => set('deadline', e.target.value)}
                disabled={loading}
                className="[color-scheme:dark]"
              />
            </div>

            {/* Lead */}
            <div className="space-y-1.5">
              <Label>Lead vinculado</Label>
              <Select
                value={fields.lead_id || 'none'}
                onValueChange={v => set('lead_id', !v || v === 'none' ? '' : v)}
                disabled={loading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {(v: string) => {
                      if (!v || v === 'none') return 'Nenhum'
                      const lead = MOCK_LEADS.find(l => l.id === v)
                      return lead ? lead.name : 'Nenhum'
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {MOCK_LEADS.map(l => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.name}{l.company ? ` · ${l.company}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Responsável */}
            <div className="space-y-1.5">
              <Label>Responsável</Label>
              <Select
                value={fields.assigned_to}
                onValueChange={v => set('assigned_to', v ?? MOCK_MEMBERS[0])}
                disabled={loading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>{(v: string) => v}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {MOCK_MEMBERS.map(m => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Stage */}
            <div className="sm:col-span-2 space-y-1.5">
              <Label>Etapa</Label>
              <Select
                value={fields.stage}
                onValueChange={v => set('stage', v as DealStage)}
                disabled={loading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {(v: string) => STAGE_CONFIG[v as DealStage]?.label ?? v}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {stageEntries.map(([key, cfg]) => (
                    <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{isEditing ? 'Salvando…' : 'Criando…'}</>
                : isEditing ? 'Salvar alterações' : 'Criar negócio'
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
