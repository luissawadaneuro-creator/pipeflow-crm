import { KanbanSquare, Users, Activity, BarChart3, UserPlus, Building2 } from 'lucide-react'

const FEATURES = [
  {
    icon: KanbanSquare,
    title: 'Pipeline Kanban',
    description: 'Arraste negócios entre 6 etapas do funil e visualize o valor total de cada fase em tempo real.',
  },
  {
    icon: Users,
    title: 'Gestão de Leads',
    description: 'Cadastre, filtre e acompanhe seus leads com busca rápida e status coloridos por etapa.',
  },
  {
    icon: Activity,
    title: 'Histórico de Atividades',
    description: 'Registre ligações, e-mails, reuniões e notas numa timeline cronológica por lead.',
  },
  {
    icon: BarChart3,
    title: 'Dashboard de Métricas',
    description: 'Acompanhe conversão, valor de pipeline e prazos próximos em um painel único e claro.',
  },
  {
    icon: UserPlus,
    title: 'Convites de Equipe',
    description: 'Convide colegas por e-mail e colabore no mesmo workspace com controle de permissões.',
  },
  {
    icon: Building2,
    title: 'Multi-Workspace',
    description: 'Gerencie múltiplos times ou empresas com dados totalmente isolados entre workspaces.',
  },
]

export function Features() {
  return (
    <section id="funcionalidades" className="px-4 py-20 sm:px-6 sm:py-28" style={{ background: 'var(--pf-bg)' }}>
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <span
            className="text-[11px] uppercase tracking-[0.15em]"
            style={{ fontFamily: 'var(--font-ibm-plex-mono), monospace', color: 'var(--pf-accent)' }}
          >
            Funcionalidades
          </span>
          <h2
            className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl"
            style={{ fontFamily: 'var(--font-syne), sans-serif', color: 'var(--pf-text)' }}
          >
            Tudo que seu time precisa para vender mais
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <div
              key={feature.title}
              className="animate-fade-slide-up group rounded-xl p-6 transition-colors"
              style={{
                background: 'var(--pf-surface)',
                border: '1px solid var(--pf-border)',
                animationDelay: `${i * 60}ms`,
              }}
            >
              <div
                className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ background: 'rgba(202,255,51,0.1)' }}
              >
                <feature.icon
                  className="h-5 w-5"
                  style={{ color: 'var(--pf-accent)' }}
                />
              </div>
              <h3
                className="text-base font-semibold"
                style={{ fontFamily: 'var(--font-syne), sans-serif', color: 'var(--pf-text)' }}
              >
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--pf-text-secondary)' }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
