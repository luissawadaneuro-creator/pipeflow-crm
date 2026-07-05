import Link from 'next/link'
import { ArrowRight, PlayCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

const RESULTS = [
  { value: '+47%', label: 'Taxa de conversão' },
  { value: '3.2x', label: 'Leads qualificados' },
  { value: '-62%', label: 'Ciclo de venda' },
  { value: '1200+', label: 'Times ativos' },
]

export function Hero() {
  return (
    <section
      className="relative overflow-hidden px-4 pb-20 pt-20 sm:px-6 sm:pb-28 sm:pt-28"
      style={{
        background: 'linear-gradient(180deg, #0C0C0E 0%, #141416 100%)',
      }}
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[480px] w-[720px] -translate-x-1/2 rounded-full opacity-20 blur-[120px]"
        style={{ background: 'var(--pf-accent)' }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-4xl text-center">
        <div
          className="animate-fade-slide-up mx-auto mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1"
          style={{ background: 'var(--pf-surface-2)', border: '1px solid var(--pf-border)' }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: 'var(--pf-accent)' }}
          />
          <span
            className="text-[11px] uppercase tracking-[0.12em]"
            style={{ fontFamily: 'var(--font-ibm-plex-mono), monospace', color: 'var(--pf-text-secondary)' }}
          >
            Feito para times de vendas e freelancers
          </span>
        </div>

        <h1
          className="animate-fade-slide-up text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl"
          style={{ animationDelay: '60ms', fontFamily: 'var(--font-syne), sans-serif', color: 'var(--pf-text)' }}
        >
          Feche mais negócios com um pipeline{' '}
          <span style={{ color: 'var(--pf-accent)' }}>visual e sem fricção</span>
        </h1>

        <p
          className="animate-fade-slide-up mx-auto mt-5 max-w-xl text-base sm:text-lg"
          style={{ animationDelay: '120ms', color: 'var(--pf-text-secondary)' }}
        >
          O PipeFlow organiza leads, negócios e atividades num Kanban visual — para você
          parar de perder oportunidades em planilhas e fechar mais rápido.
        </p>

        <div
          className="animate-fade-slide-up mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          style={{ animationDelay: '180ms' }}
        >
          <Link href="/signup">
            <Button size="lg" className="h-11 px-6 text-sm">
              Começar grátis
              <ArrowRight data-icon="inline-end" />
            </Button>
          </Link>
          <a href="#funcionalidades">
            <Button variant="outline" size="lg" className="h-11 px-6 text-sm">
              <PlayCircle data-icon="inline-start" />
              Ver como funciona
            </Button>
          </a>
        </div>

        {/* Result numbers */}
        <dl
          className="animate-fade-slide-up mt-16 grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-4"
          style={{ animationDelay: '240ms' }}
        >
          {RESULTS.map(result => (
            <div key={result.label} className="flex flex-col items-center">
              <dt className="sr-only">{result.label}</dt>
              <dd
                className="text-2xl font-bold tracking-tight sm:text-3xl"
                style={{ fontFamily: 'var(--font-ibm-plex-mono), monospace', color: 'var(--pf-accent)' }}
              >
                {result.value}
              </dd>
              <p
                className="mt-1 text-xs sm:text-sm"
                style={{ color: 'var(--pf-text-muted)' }}
              >
                {result.label}
              </p>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
