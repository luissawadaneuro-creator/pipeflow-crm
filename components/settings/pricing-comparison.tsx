import { Check, Sparkles } from 'lucide-react'
import type { WorkspacePlan } from '@/types'
import { FREE_PLAN_LEAD_LIMIT, FREE_PLAN_MEMBER_LIMIT } from '@/lib/limits'

interface PricingComparisonProps {
  currentPlan: WorkspacePlan
}

const FREE_FEATURES = [
  `Até ${FREE_PLAN_LEAD_LIMIT} leads`,
  `Até ${FREE_PLAN_MEMBER_LIMIT} membros`,
  'Pipeline Kanban',
  'Registro de atividades',
]

const PRO_FEATURES = [
  'Leads ilimitados',
  'Membros ilimitados',
  'Pipeline Kanban',
  'Registro de atividades',
  'Suporte prioritário',
]

export function PricingComparison({ currentPlan }: PricingComparisonProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div
        className={`rounded-xl border p-5 space-y-4 ${
          currentPlan === 'free' ? 'border-primary bg-primary/5' : 'border-border bg-card'
        }`}
      >
        <div>
          <h3 className="text-base font-semibold text-foreground">Free</h3>
          <p className="text-sm text-muted-foreground">Grátis para sempre</p>
        </div>
        <ul className="space-y-2">
          {FREE_FEATURES.map((feature) => (
            <li key={feature} className="flex items-center gap-2 text-sm text-foreground">
              <Check className="w-4 h-4 text-muted-foreground shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
      </div>

      <div
        className={`rounded-xl border p-5 space-y-4 ${
          currentPlan === 'pro' ? 'border-primary bg-primary/5' : 'border-border bg-card'
        }`}
      >
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-foreground">Pro</h3>
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground">R$ 49/mês</p>
        <ul className="space-y-2">
          {PRO_FEATURES.map((feature) => (
            <li key={feature} className="flex items-center gap-2 text-sm text-foreground">
              <Check className="w-4 h-4 text-primary shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
