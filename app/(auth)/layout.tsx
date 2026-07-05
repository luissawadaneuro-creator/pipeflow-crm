import { Logo } from '@/components/shared/logo'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ background: 'var(--pf-bg)' }}>
      <div className="mb-8">
        <Logo size="lg" />
      </div>
      {children}
    </div>
  )
}
