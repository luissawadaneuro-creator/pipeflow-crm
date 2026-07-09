'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { loginWithPassword } from './actions'

interface FieldErrors {
  email?: string
  password?: string
}

function validate(email: string, password: string): FieldErrors {
  const errors: FieldErrors = {}
  if (!email) errors.email = 'E-mail obrigatório'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'E-mail inválido'
  if (!password) errors.password = 'Senha obrigatória'
  else if (password.length < 6) errors.password = 'Mínimo 6 caracteres'
  return errors
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/dashboard'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [globalError, setGlobalError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setGlobalError('')

    const fieldErrors = validate(email, password)
    setErrors(fieldErrors)
    if (Object.keys(fieldErrors).length > 0) return

    setLoading(true)
    const result = await loginWithPassword(email, password)
    setLoading(false)

    if (result.error) {
      setGlobalError(result.error)
      return
    }

    router.push(redirectTo)
    router.refresh()
  }

  return (
    <div className="w-full max-w-sm">
      <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-foreground">Entrar na conta</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Bem-vindo de volta ao PipeFlow
          </p>
        </div>

        {globalError && (
          <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2.5 text-sm text-destructive">
            {globalError}
          </div>
        )}

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
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
              }}
              className={errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}
              disabled={loading}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Senha</Label>
              <Link
                href="/reset-password"
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Esqueceu a senha?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
              }}
              className={errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}
              disabled={loading}
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Entrando…
              </>
            ) : (
              'Entrar'
            )}
          </Button>
        </form>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-4">
        Não tem conta?{' '}
        <Link href="/signup" className="text-primary hover:underline font-medium">
          Criar conta grátis
        </Link>
      </p>
    </div>
  )
}
