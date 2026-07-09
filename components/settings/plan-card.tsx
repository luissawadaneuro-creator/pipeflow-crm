'use client'

import { useState } from 'react'
import { Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createCheckoutSession, createPortalSession } from '@/app/(dashboard)/settings/billing/actions'
import type { WorkspacePlan } from '@/types'

interface PlanCardProps {
  plan: WorkspacePlan
  planStatus: 'active' | 'canceled' | 'trialing' | null
  hasStripeCustomer: boolean
  isAdmin: boolean
  memberCount: number
  memberLimit: number
  leadCount: number
  leadLimit: number
}

export function PlanCard({
  plan,
  planStatus,
  hasStripeCustomer,
  isAdmin,
  memberCount,
  memberLimit,
  leadCount,
  leadLimit,
}: PlanCardProps) {
  const [loading, setLoading] = useState(false)

  async function handleSubscribe() {
    setLoading(true)
    const result = await createCheckoutSession()
    if (result?.error) {
      setLoading(false)
      toast.error(result.error)
    }
    // On success the Server Action redirects to Stripe Checkout — no further state needed.
  }

  async function handleManageSubscription() {
    setLoading(true)
    const result = await createPortalSession()
    if (result?.error) {
      setLoading(false)
      toast.error(result.error)
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">
              Plano {plan === 'pro' ? 'Pro' : 'Free'}
            </h2>
            <Badge variant={plan === 'pro' ? 'default' : 'secondary'}>
              {plan === 'pro' ? 'R$ 49/mês' : 'Grátis'}
            </Badge>
          </div>
          {plan === 'pro' && planStatus && (
            <p className="text-xs text-muted-foreground mt-1">
              Status: {planStatus === 'active' ? 'ativa' : planStatus === 'trialing' ? 'em teste' : 'cancelada'}
            </p>
          )}
        </div>

        {isAdmin && plan === 'free' && (
          <Button onClick={handleSubscribe} disabled={loading}>
            {loading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Redirecionando…</>
            ) : (
              <><Sparkles className="w-4 h-4 mr-1.5" />Assinar Pro</>
            )}
          </Button>
        )}

        {isAdmin && plan === 'pro' && hasStripeCustomer && (
          <Button variant="outline" onClick={handleManageSubscription} disabled={loading}>
            {loading ? 'Abrindo…' : 'Gerenciar assinatura'}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-lg border border-border p-3">
          <p className="text-xs text-muted-foreground">Membros</p>
          <p className="text-sm font-medium text-foreground mt-0.5">
            {memberCount} {plan === 'free' ? `de ${memberLimit}` : ''}
          </p>
        </div>
        <div className="rounded-lg border border-border p-3">
          <p className="text-xs text-muted-foreground">Leads</p>
          <p className="text-sm font-medium text-foreground mt-0.5">
            {leadCount} {plan === 'free' ? `de ${leadLimit}` : ''}
          </p>
        </div>
      </div>

      {plan === 'free' && (
        <p className="text-xs text-muted-foreground">
          O plano Pro remove os limites de membros e leads do workspace.
        </p>
      )}
    </div>
  )
}
