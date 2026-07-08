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
import type { ActivityType } from '@/types'

const TYPE_LABELS: Record<ActivityType, string> = {
  call: 'Ligação',
  email: 'E-mail',
  meeting: 'Reunião',
  note: 'Nota',
}

export interface ActivityFormFields {
  type: ActivityType
  description: string
  date: string
}

interface ActivityFormProps {
  open: boolean
  onClose: () => void
  onSave: (data: ActivityFormFields) => void | Promise<void>
}

function todayLocal() {
  const now = new Date()
  const offset = now.getTimezoneOffset()
  return new Date(now.getTime() - offset * 60_000).toISOString().slice(0, 16)
}

export function ActivityForm({ open, onClose, onSave }: ActivityFormProps) {
  const empty: ActivityFormFields = {
    type: 'call',
    description: '',
    date: todayLocal(),
  }

  const [fields, setFields] = useState<ActivityFormFields>(empty)
  const [errors, setErrors] = useState<{ description?: string }>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setFields({ ...empty, date: todayLocal() })
      setErrors({})
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  function set<K extends keyof ActivityFormFields>(key: K, value: ActivityFormFields[K]) {
    setFields((prev) => ({ ...prev, [key]: value }))
    if (key in errors) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs: typeof errors = {}
    if (!fields.description.trim()) errs.description = 'Descrição obrigatória'
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setLoading(true)
    await onSave(fields)
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle>Registrar atividade</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            {/* Tipo */}
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select
                value={fields.type}
                onValueChange={(v) => set('type', v as ActivityType)}
                disabled={loading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>{(v: string) => TYPE_LABELS[v as ActivityType] ?? v}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="call">Ligação</SelectItem>
                  <SelectItem value="email">E-mail</SelectItem>
                  <SelectItem value="meeting">Reunião</SelectItem>
                  <SelectItem value="note">Nota</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Data */}
            <div className="space-y-1.5">
              <Label htmlFor="af-date">Data</Label>
              <Input
                id="af-date"
                type="datetime-local"
                value={fields.date}
                onChange={(e) => set('date', e.target.value)}
                disabled={loading}
                className="[color-scheme:dark]"
              />
            </div>

            {/* Descrição */}
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="af-description">Descrição *</Label>
              <Input
                id="af-description"
                value={fields.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Ex: Ligação de follow-up sobre a proposta"
                disabled={loading}
                className={errors.description ? 'border-destructive' : ''}
              />
              {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Registrando…</>
              ) : (
                'Registrar atividade'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
