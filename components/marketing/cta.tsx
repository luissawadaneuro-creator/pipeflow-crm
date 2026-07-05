import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Cta() {
  return (
    <section className="px-4 py-20 sm:px-6 sm:py-28" style={{ background: 'var(--pf-bg)' }}>
      <div
        className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl px-6 py-14 text-center sm:px-12 sm:py-16"
        style={{
          background: 'linear-gradient(135deg, #141416 0%, #1A1A1E 100%)',
          border: '1px solid var(--pf-border)',
        }}
      >
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-64 w-96 -translate-x-1/2 -translate-y-1/3 rounded-full opacity-20 blur-[100px]"
          style={{ background: 'var(--pf-accent)' }}
          aria-hidden="true"
        />

        <h2
          className="relative text-3xl font-bold tracking-tight sm:text-4xl"
          style={{ fontFamily: 'var(--font-syne), sans-serif', color: 'var(--pf-text)' }}
        >
          Pronto para organizar seu pipeline?
        </h2>
        <p className="relative mx-auto mt-4 max-w-md text-sm sm:text-base" style={{ color: 'var(--pf-text-secondary)' }}>
          Crie sua conta gratuita em menos de 2 minutos. Sem cartão de crédito.
        </p>

        <div className="relative mt-8">
          <Link href="/signup">
            <Button size="lg" className="h-11 px-7 text-sm">
              Começar grátis
              <ArrowRight data-icon="inline-end" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
