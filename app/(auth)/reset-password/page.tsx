'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  function validate(): boolean {
    if (!email) { setEmailError('E-mail obrigatório'); return false }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailError('E-mail inválido'); return false }
    return true
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    await new Promise((r) => setTimeout(r, 1000))
    setLoading(false)
    setSent(true)
  }

  if (sent) {
    return (
      <div className="w-full max-w-sm">
        <div className="rounded-xl border border-border bg-card p-8 shadow-sm text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
          </div>
          <h1 className="text-lg font-semibold text-foreground mb-2">E-mail enviado</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Se <span className="text-foreground font-medium">{email}</span> estiver cadastrado,
            você receberá um link para redefinir sua senha em breve.
          </p>
          <Link href="/login">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para o login
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm">
      <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-foreground">Recuperar senha</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Enviaremos um link para o seu e-mail
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (emailError) setEmailError('')
              }}
              className={emailError ? 'border-destructive focus-visible:ring-destructive' : ''}
              disabled={loading}
            />
            {emailError && (
              <p className="text-xs text-destructive">{emailError}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enviando…
              </>
            ) : (
              'Enviar link de recuperação'
            )}
          </Button>
        </form>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-4">
        Lembrou a senha?{' '}
        <Link href="/login" className="text-primary hover:underline font-medium">
          Entrar
        </Link>
      </p>
    </div>
  )
}
