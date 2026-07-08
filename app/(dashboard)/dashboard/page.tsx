import { redirect } from 'next/navigation'
import { Users, Briefcase, Wallet, TrendingUp } from 'lucide-react'
import { MetricCard } from '@/components/dashboard/metric-card'
import { FunnelChart } from '@/components/dashboard/funnel-chart'
import { UpcomingDeals } from '@/components/dashboard/upcoming-deals'
import { createClient } from '@/lib/supabase/server'
import { getActiveWorkspaceContext } from '@/lib/supabase/workspace-context'
import { getDashboardMetrics, getDealsByStage, getUpcomingDeals } from '@/lib/supabase/queries'

function formatBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const context = await getActiveWorkspaceContext(supabase)
  if (!context) redirect('/login')

  const [metrics, funnelData, upcomingDeals] = await Promise.all([
    getDashboardMetrics(supabase, context.workspaceId),
    getDealsByStage(supabase, context.workspaceId),
    getUpcomingDeals(supabase, context.workspaceId),
  ])

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground mb-1">Dashboard</h1>
      <p className="text-muted-foreground text-sm mb-6">Visão geral das suas métricas de vendas.</p>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Total de Leads"
            value={metrics.totalLeads.toString()}
            icon={Users}
          />
          <MetricCard
            label="Negócios Abertos"
            value={metrics.openDeals.toString()}
            icon={Briefcase}
          />
          <MetricCard
            label="Valor do Pipeline"
            value={formatBRL(metrics.pipelineValue)}
            icon={Wallet}
          />
          <MetricCard
            label="Taxa de Conversão"
            value={`${metrics.conversionRate.toFixed(0)}%`}
            icon={TrendingUp}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <FunnelChart data={funnelData} />
          <UpcomingDeals deals={upcomingDeals} />
        </div>
      </div>
    </div>
  )
}
