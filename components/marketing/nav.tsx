'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { Logo } from '@/components/shared/logo'
import { Button } from '@/components/ui/button'

const NAV_LINKS = [
  { href: '#funcionalidades', label: 'Funcionalidades' },
  { href: '#precos', label: 'Preços' },
]

export function MarketingNav() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-md"
      style={{
        background: 'color-mix(in srgb, var(--pf-bg) 85%, transparent)',
        borderBottom: '1px solid var(--pf-border-subtle)',
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" aria-label="PipeFlow — página inicial">
          <Logo size="md" />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map(link => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium transition-colors"
              style={{ color: 'var(--pf-text-secondary)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--pf-text)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--pf-text-secondary)')}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/login">
            <Button variant="ghost" size="lg">
              Entrar
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="lg">Começar grátis</Button>
          </Link>
        </div>

        <button
          onClick={() => setMobileOpen(v => !v)}
          className="p-2 md:hidden"
          style={{ color: 'var(--pf-text)' }}
          aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div
          className="flex flex-col gap-1 px-4 pb-4 md:hidden"
          style={{ borderTop: '1px solid var(--pf-border-subtle)' }}
        >
          {NAV_LINKS.map(link => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium"
              style={{ color: 'var(--pf-text-secondary)' }}
            >
              {link.label}
            </a>
          ))}
          <div className="mt-2 flex flex-col gap-2 pt-2" style={{ borderTop: '1px solid var(--pf-border-subtle)' }}>
            <Link href="/login" onClick={() => setMobileOpen(false)}>
              <Button variant="outline" size="lg" className="w-full">
                Entrar
              </Button>
            </Link>
            <Link href="/signup" onClick={() => setMobileOpen(false)}>
              <Button size="lg" className="w-full">
                Começar grátis
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
