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
import type { Lead, LeadStatus, Member } from '@/types'

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'Novo',
  contacted: 'Contatado',
  qualified: 'Qualificado',
  lost: 'Perdido',
}

export interface LeadFormFields {
  name: string
  email: string
  phone: string
  company: string
  role: string
  status: LeadStatus
  assigned_to: string
}

interface FieldErrors {
  name?: string
  email?: string
}

function memberLabel(member: Member) {
  return member.full_name || member.email || member.user_id
}

function validate(fields: LeadFormFields): FieldErrors {
  const errors: FieldErrors = {}
  if (!fields.name.trim()) errors.name = 'Nome obrigatório'
  if (fields.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
    errors.email = 'E-mail inválido'
  }
  return errors
}

interface LeadFormProps {
  open: boolean
  onClose: () => void
  onSave: (data: LeadFormFields) => void | Promise<void>
  lead?: Lead | null
  members: Member[]
}

export function LeadForm({ open, onClose, onSave, lead, members }: LeadFormProps) {
  const isEditing = !!lead
  const defaultAssignee = members[0]?.user_id ?? ''

  const emptyFields: LeadFormFields = {
    name: '',
    email: '',
    phone: '',
    company: '',
    role: '',
    status: 'new',
    assigned_to: defaultAssignee,
  }

  const [fields, setFields] = useState<LeadFormFields>(emptyFields)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setFields(
        lead
          ? {
              name: lead.name,
              email: lead.email ?? '',
              phone: lead.phone ?? '',
              company: lead.company ?? '',
              role: lead.role ?? '',
              status: lead.status,
              assigned_to: lead.assigned_to ?? defaultAssignee,
            }
          : emptyFields
      )
      setErrors({})
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, lead])

  function set<K extends keyof LeadFormFields>(key: K, value: LeadFormFields[K]) {
    setFields((prev) => ({ ...prev, [key]: value }))
    if (key in errors) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate(fields)
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
          <DialogTitle>{isEditing ? 'Editar lead' : 'Novo lead'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            {/* Nome */}
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="lf-name">Nome *</Label>
              <Input
                id="lf-name"
                value={fields.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="João Silva"
                disabled={loading}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            {/* E-mail */}
            <div className="space-y-1.5">
              <Label htmlFor="lf-email">E-mail</Label>
              <Input
                id="lf-email"
                type="email"
                value={fields.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="joao@empresa.com"
                disabled={loading}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            {/* Telefone */}
            <div className="space-y-1.5">
              <Label htmlFor="lf-phone">Telefone</Label>
              <Input
                id="lf-phone"
                value={fields.phone}
                onChange={(e) => set('phone', e.target.value)}
                placeholder="(11) 99999-9999"
                disabled={loading}
              />
            </div>

            {/* Empresa */}
            <div className="space-y-1.5">
              <Label htmlFor="lf-company">Empresa</Label>
              <Input
                id="lf-company"
                value={fields.company}
                onChange={(e) => set('company', e.target.value)}
                placeholder="Acme Corp"
                disabled={loading}
              />
            </div>

            {/* Cargo */}
            <div className="space-y-1.5">
              <Label htmlFor="lf-role">Cargo</Label>
              <Input
                id="lf-role"
                value={fields.role}
                onChange={(e) => set('role', e.target.value)}
                placeholder="CEO"
                disabled={loading}
              />
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={fields.status}
                onValueChange={(v) => set('status', v as LeadStatus)}
                disabled={loading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>{(v: string) => STATUS_LABELS[v as LeadStatus] ?? v}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">Novo</SelectItem>
                  <SelectItem value="contacted">Contatado</SelectItem>
                  <SelectItem value="qualified">Qualificado</SelectItem>
                  <SelectItem value="lost">Perdido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Responsável */}
            <div className="space-y-1.5">
              <Label>Responsável</Label>
              <Select
                value={fields.assigned_to}
                onValueChange={(v) => set('assigned_to', v ?? defaultAssignee)}
                disabled={loading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {(v: string) => {
                      const member = members.find((m) => m.user_id === v)
                      return member ? memberLabel(member) : v
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {members.map((m) => (
                    <SelectItem key={m.user_id} value={m.user_id}>{memberLabel(m)}</SelectItem>
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
              {loading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{isEditing ? 'Salvando…' : 'Criando…'}</>
              ) : (
                isEditing ? 'Salvar alterações' : 'Criar lead'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
