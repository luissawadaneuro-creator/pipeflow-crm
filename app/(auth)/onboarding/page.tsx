'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const SUGGESTIONS = ['Acme Vendas', 'Minha Empresa', 'StartupX', 'Freelancer Pessoal']

export default function OnboardingPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [nameError, setNameError] = useState('')
  const [loading, setLoading] = useState(false)

  function validate(): boolean {
    if (!name.trim()) { setNameError('Nome do workspace obrigatório'); return false }
    if (name.trim().length < 2) { setNameError('Nome muito curto'); return false }
    if (name.trim().length > 50) { setNameError('Máximo 50 caracteres'); return false }
    return true
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    await new Promise((r) => setTimeout(r, 900))
    setLoading(false)

    router.push('/dashboard')
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
        {/* Progress indicator */}
        <div className="flex items-center gap-2 mb-6">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary flex items-center justify-center">
              <span className="text-[10px] font-bold text-primary">✓</span>
            </div>
            <span className="text-xs text-muted-foreground">Conta criada</span>
          </div>
          <div className="flex-1 h-px bg-border" />
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
              <span className="text-[10px] font-bold text-primary-foreground">2</span>
            </div>
            <span className="text-xs text-foreground font-medium">Workspace</span>
          </div>
          <div className="flex-1 h-px bg-border" />
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-secondary border border-border flex items-center justify-center">
              <span className="text-[10px] font-bold text-muted-foreground">3</span>
            </div>
            <span className="text-xs text-muted-foreground">Pronto</span>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 border border-primary/20">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Crie seu workspace</h1>
            <p className="text-sm text-muted-foreground">Onde você vai gerenciar seus leads</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-6 mt-4">
          Um workspace é o espaço da sua equipe ou empresa dentro do PipeFlow.
          Você pode criar mais depois ou convidar colaboradores.
        </p>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="workspace-name">Nome do workspace</Label>
            <Input
              id="workspace-name"
              type="text"
              placeholder="Ex: Acme Vendas"
              autoFocus
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (nameError) setNameError('')
              }}
              className={nameError ? 'border-destructive focus-visible:ring-destructive' : ''}
              disabled={loading}
              maxLength={51}
            />
            {nameError ? (
              <p className="text-xs text-destructive">{nameError}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Pode ser o nome da sua empresa, time ou projeto.
              </p>
            )}
          </div>

          {/* Quick suggestions */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Sugestões:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => { setName(s); setNameError('') }}
                  className="text-xs px-2.5 py-1 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-primary/5 transition-colors"
                  disabled={loading}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Criando workspace…
              </>
            ) : (
              'Criar workspace e entrar'
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
