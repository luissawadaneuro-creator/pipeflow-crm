import { MOCK_DEALS } from '@/lib/mock-pipeline'
import { MOCK_LEADS } from '@/lib/mock-leads'
import type { Deal, DealStage } from '@/types'

const OPEN_STAGES: DealStage[] = ['new_lead', 'contacted', 'proposal_sent', 'negotiation']

export interface DashboardMetrics {
  totalLeads: number
  openDeals: number
  pipelineValue: number
  conversionRate: number
}

export function getDashboardMetrics(): DashboardMetrics {
  const totalLeads = MOCK_LEADS.length

  const openDeals = MOCK_DEALS.filter(d => OPEN_STAGES.includes(d.stage))
  const won = MOCK_DEALS.filter(d => d.stage === 'won')
  const lost = MOCK_DEALS.filter(d => d.stage === 'lost')

  const pipelineValue = openDeals.reduce((sum, d) => sum + d.value, 0)
  const conversionRate = won.length + lost.length > 0
    ? (won.length / (won.length + lost.length)) * 100
    : 0

  return {
    totalLeads,
    openDeals: openDeals.length,
    pipelineValue,
    conversionRate,
  }
}

export interface FunnelStagePoint {
  stage: DealStage
  label: string
  count: number
  color: string
}

const STAGE_ORDER: DealStage[] = ['new_lead', 'contacted', 'proposal_sent', 'negotiation', 'won', 'lost']

const STAGE_LABELS: Record<DealStage, string> = {
  new_lead: 'Novo Lead',
  contacted: 'Contatado',
  proposal_sent: 'Proposta Enviada',
  negotiation: 'Negociação',
  won: 'Fechado Ganho',
  lost: 'Fechado Perdido',
}

const STAGE_COLORS: Record<DealStage, string> = {
  new_lead: '#5B7FFF',
  contacted: '#00B4D8',
  proposal_sent: '#CAFF33',
  negotiation: '#FF6B35',
  won: '#2ED573',
  lost: '#FF4757',
}

export function getDealsByStage(): FunnelStagePoint[] {
  return STAGE_ORDER.map(stage => ({
    stage,
    label: STAGE_LABELS[stage],
    count: MOCK_DEALS.filter(d => d.stage === stage).length,
    color: STAGE_COLORS[stage],
  }))
}

export function getUpcomingDeals(referenceDate: Date = new Date(), limit = 5): Deal[] {
  const horizon = new Date(referenceDate.getTime() + 7 * 86_400_000)

  return MOCK_DEALS
    .filter(d => d.deadline && OPEN_STAGES.includes(d.stage))
    .filter(d => new Date(d.deadline as string).getTime() <= horizon.getTime())
    .sort((a, b) => new Date(a.deadline as string).getTime() - new Date(b.deadline as string).getTime())
    .slice(0, limit)
}
