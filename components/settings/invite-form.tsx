'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
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
import { sendInvite } from '@/app/(dashboard)/settings/members/actions'
import type { WorkspaceRole } from '@/types'

interface InviteFormProps {
  disabled?: boolean
}

export function InviteForm({ disabled }: InviteFormProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<WorkspaceRole>('member')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function reset() {
    setEmail('')
    setRole('member')
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('E-mail inválido')
      return
    }

    setLoading(true)
    const result = await sendInvite(email, role)
    setLoading(false)

    if (result.error) {
      setError(result.error)
      return
    }

    toast.success('Convite enviado com sucesso.')
    setOpen(false)
    reset()
    router.refresh()
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="shrink-0"
        disabled={disabled}
        title={disabled ? 'Limite de membros do plano Free atingido' : undefined}
      >
        <UserPlus className="w-4 h-4 mr-1.5" />
        Convidar
      </Button>

      <Dialog open={open} onOpenChange={(v) => { if (!v) { setOpen(false); reset() } }}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle>Convidar colaborador</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="invite-email">E-mail</Label>
                <Input
                  id="invite-email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError('') }}
                  placeholder="colega@empresa.com"
                  disabled={loading}
                  className={error ? 'border-destructive' : ''}
                />
                {error && <p className="text-xs text-destructive">{error}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>Papel</Label>
                <Select value={role} onValueChange={(v) => setRole(v as WorkspaceRole)} disabled={loading}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Membro</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setOpen(false); reset() }} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enviando…</>
                ) : (
                  'Enviar convite'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
