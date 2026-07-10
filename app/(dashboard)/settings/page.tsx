import Link from 'next/link'
import { Users, CreditCard } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground mb-1">Configurações</h1>
      <p className="text-muted-foreground text-sm">Gerencie seu workspace e conta.</p>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/settings/members"
          className="rounded-xl border border-border bg-card p-6 flex items-start gap-3 hover:bg-secondary/30 transition-colors"
        >
          <Users className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-foreground">Membros</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Convide colaboradores e gerencie papéis do workspace.
            </p>
          </div>
        </Link>

        <Link
          href="/settings/billing"
          className="rounded-xl border border-border bg-card p-6 flex items-start gap-3 hover:bg-secondary/30 transition-colors"
        >
          <CreditCard className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-foreground">Cobrança</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Veja seu plano atual e gerencie a assinatura.
            </p>
          </div>
        </Link>
      </div>
    </div>
  )
}
