import Link from 'next/link'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

const PLANS = [
  {
    name: 'Grátis',
    price: 'R$ 0',
    period: '/sempre',
    description: 'Para começar a organizar seu pipeline de vendas.',
    cta: 'Começar grátis',
    highlighted: false,
    features: [
      'Até 2 membros no workspace',
      'Até 50 leads',
      'Pipeline Kanban completo',
      'Histórico de atividades',
      'Dashboard de métricas',
    ],
  },
  {
    name: 'Pro',
    price: 'R$ 49',
    period: '/mês',
    description: 'Para times que querem escalar sem limites.',
    cta: 'Assinar Pro',
    highlighted: true,
    features: [
      'Membros ilimitados',
      'Leads ilimitados',
      'Pipeline Kanban completo',
      'Histórico de atividades',
      'Dashboard de métricas',
      'Convites de equipe via e-mail',
      'Suporte prioritário',
    ],
  },
]

export function Pricing() {
  return (
    <section id="precos" className="px-4 py-20 sm:px-6 sm:py-28" style={{ background: 'var(--pf-surface)' }}>
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <span
            className="text-[11px] uppercase tracking-[0.15em]"
            style={{ fontFamily: 'var(--font-ibm-plex-mono), monospace', color: 'var(--pf-accent)' }}
          >
            Preços
          </span>
          <h2
            className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl"
            style={{ fontFamily: 'var(--font-syne), sans-serif', color: 'var(--pf-text)' }}
          >
            Simples, transparente, sem pegadinhas
          </h2>
        </div>

        <div className="mx-auto mt-14 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
          {PLANS.map(plan => (
            <div
              key={plan.name}
              className="relative rounded-xl p-6"
              style={{
                background: 'var(--pf-bg)',
                border: plan.highlighted ? '1px solid var(--pf-accent)' : '1px solid var(--pf-border)',
                boxShadow: plan.highlighted ? '0 8px 32px -8px rgba(202,255,51,0.15)' : undefined,
              }}
            >
              {plan.highlighted && (
                <span
                  className="absolute -top-3 left-6 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em]"
                  style={{
                    background: 'var(--pf-accent)',
                    color: 'var(--pf-bg)',
                    fontFamily: 'var(--font-ibm-plex-mono), monospace',
                  }}
                >
                  Mais popular
                </span>
              )}

              <h3
                className="text-lg font-semibold"
                style={{ fontFamily: 'var(--font-syne), sans-serif', color: 'var(--pf-text)' }}
              >
                {plan.name}
              </h3>
              <p className="mt-1 text-sm" style={{ color: 'var(--pf-text-secondary)' }}>
                {plan.description}
              </p>

              <div className="mt-5 flex items-baseline gap-1">
                <span
                  className="text-4xl font-bold tracking-tight"
                  style={{ fontFamily: 'var(--font-ibm-plex-mono), monospace', color: 'var(--pf-text)' }}
                >
                  {plan.price}
                </span>
                <span className="text-sm" style={{ color: 'var(--pf-text-muted)' }}>
                  {plan.period}
                </span>
              </div>

              <Link href="/signup" className="mt-6 block">
                <Button
                  size="lg"
                  variant={plan.highlighted ? 'default' : 'outline'}
                  className="h-11 w-full text-sm"
                >
                  {plan.cta}
                </Button>
              </Link>

              <ul className="mt-6 space-y-3">
                {plan.features.map(feature => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm">
                    <Check
                      className="mt-0.5 h-4 w-4 shrink-0"
                      style={{ color: plan.highlighted ? 'var(--pf-accent)' : 'var(--pf-text-muted)' }}
                    />
                    <span style={{ color: 'var(--pf-text-secondary)' }}>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
