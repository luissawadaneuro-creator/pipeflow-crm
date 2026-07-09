'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/shared/logo'

type InviteState =
  | { status: 'loading' }
  | { status: 'requires-auth'; workspaceName: string; email: string }
  | { status: 'error'; message: string }
  | { status: 'success'; workspaceId: string }

interface InviteAcceptCardProps {
  token: string
}

export function InviteAcceptCard({ token }: InviteAcceptCardProps) {
  const router = useRouter()
  const [state, setState] = useState<InviteState>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false

    fetch(`/api/invites/${token}`)
      .then(async (res) => {
        const data = await res.json()
        if (cancelled) return

        if (!res.ok) {
          setState({ status: 'error', message: data.error ?? 'Não foi possível processar o convite.' })
          return
        }
        if (data.requiresAuth) {
          setState({ status: 'requires-auth', workspaceName: data.workspaceName, email: data.email })
          return
        }
        setState({ status: 'success', workspaceId: data.workspaceId })
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'error', message: 'Erro de conexão. Tente novamente.' })
      })

    return () => {
      cancelled = true
    }
  }, [token])

  useEffect(() => {
    if (state.status === 'success') {
      const timeout = setTimeout(() => {
        router.push('/dashboard')
        router.refresh()
      }, 1500)
      return () => clearTimeout(timeout)
    }
  }, [state, router])

  return (
    <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-sm text-center">
      <div className="flex justify-center mb-6">
        <Logo size="md" />
      </div>

      {state.status === 'loading' && (
        <div className="flex flex-col items-center gap-3 py-4">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Verificando convite…</p>
        </div>
      )}

      {state.status === 'requires-auth' && (
        <div className="space-y-4">
          <p className="text-sm text-foreground">
            Você foi convidado para o workspace{' '}
            <span className="font-medium">{state.workspaceName}</span>.
          </p>
          <p className="text-xs text-muted-foreground">
            Crie uma conta ou entre com <span className="font-medium">{state.email}</span> para aceitar.
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <Button onClick={() => router.push(`/signup?redirect=/invite/${token}`)}>
              Criar conta
            </Button>
            <Button variant="outline" onClick={() => router.push(`/login?redirect=/invite/${token}`)}>
              Já tenho conta
            </Button>
          </div>
        </div>
      )}

      {state.status === 'error' && (
        <div className="flex flex-col items-center gap-3 py-2">
          <XCircle className="w-8 h-8 text-destructive" />
          <p className="text-sm text-foreground">{state.message}</p>
          <Button variant="outline" className="mt-2" onClick={() => router.push('/dashboard')}>
            Ir para o dashboard
          </Button>
        </div>
      )}

      {state.status === 'success' && (
        <div className="flex flex-col items-center gap-3 py-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          <p className="text-sm text-foreground">Convite aceito! Redirecionando…</p>
        </div>
      )}
    </div>
  )
}
