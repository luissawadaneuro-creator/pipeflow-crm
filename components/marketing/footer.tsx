import Link from 'next/link'
import { Logo } from '@/components/shared/logo'

const currentYear = new Date().getFullYear()

export function MarketingFooter() {
  return (
    <footer style={{ borderTop: '1px solid var(--pf-border-subtle)', background: 'var(--pf-bg)' }}>
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-10 sm:flex-row sm:justify-between sm:px-6">
        <Link href="/" aria-label="PipeFlow — página inicial">
          <Logo size="sm" />
        </Link>

        <nav className="flex items-center gap-6">
          <a
            href="#funcionalidades"
            className="text-sm"
            style={{ color: 'var(--pf-text-muted)' }}
          >
            Funcionalidades
          </a>
          <a
            href="#precos"
            className="text-sm"
            style={{ color: 'var(--pf-text-muted)' }}
          >
            Preços
          </a>
          <Link
            href="/login"
            className="text-sm"
            style={{ color: 'var(--pf-text-muted)' }}
          >
            Entrar
          </Link>
        </nav>

        <p
          className="text-xs"
          style={{ fontFamily: 'var(--font-ibm-plex-mono), monospace', color: 'var(--pf-text-muted)' }}
        >
          © {currentYear} PipeFlow. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  )
}
