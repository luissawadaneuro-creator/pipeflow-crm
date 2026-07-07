'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updatePassword } from './actions'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  function validate(): boolean {
    if (!password) { setError('Senha obrigatória'); return false }
    if (password.length < 6) { setError('Mínimo 6 caracteres'); return false }
    if (password !== confirmPassword) { setError('As senhas não coincidem'); return false }
    return true
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!validate()) return

    setLoading(true)
    const result = await updatePassword(password)
    setLoading(false)

    if (result.error) {
      setError(result.error)
      return
    }

    setDone(true)
    setTimeout(() => router.push('/dashboard'), 1500)
  }

  if (done) {
    return (
      <div className="w-full max-w-sm">
        <div className="rounded-xl border border-border bg-card p-8 shadow-sm text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
          </div>
          <h1 className="text-lg font-semibold text-foreground mb-2">Senha atualizada</h1>
          <p className="text-sm text-muted-foreground">Redirecionando para o dashboard…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm">
      <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-foreground">Nova senha</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Escolha uma nova senha para sua conta
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2.5 text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="password">Nova senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirmar senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Repita a senha"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando…
              </>
            ) : (
              'Salvar nova senha'
            )}
          </Button>
        </form>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-4">
        <Link href="/login" className="text-primary hover:underline font-medium">
          Voltar para o login
        </Link>
      </p>
    </div>
  )
}
