import { Users, Briefcase, Wallet, TrendingUp } from 'lucide-react'
import { MetricCard } from '@/components/dashboard/metric-card'
import { FunnelChart } from '@/components/dashboard/funnel-chart'
import { UpcomingDeals } from '@/components/dashboard/upcoming-deals'
import { getDashboardMetrics, getDealsByStage, getUpcomingDeals } from '@/lib/mock-dashboard'

function formatBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export default function DashboardPage() {
  const metrics = getDashboardMetrics()
  const funnelData = getDealsByStage()
  const upcomingDeals = getUpcomingDeals()

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
            change={12}
          />
          <MetricCard
            label="Negócios Abertos"
            value={metrics.openDeals.toString()}
            icon={Briefcase}
            change={8}
          />
          <MetricCard
            label="Valor do Pipeline"
            value={formatBRL(metrics.pipelineValue)}
            icon={Wallet}
            change={15}
          />
          <MetricCard
            label="Taxa de Conversão"
            value={`${metrics.conversionRate.toFixed(0)}%`}
            icon={TrendingUp}
            change={-4}
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
