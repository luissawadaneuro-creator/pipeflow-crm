import type { DealStage } from '@/types'

export const PIPELINE_STAGES = [
  'new_lead',
  'contacted',
  'proposal_sent',
  'negotiation',
  'won',
  'lost',
] as const satisfies readonly DealStage[]

export const PIPELINE_STAGE_LABELS: Record<DealStage, string> = {
  new_lead: 'Novo Lead',
  contacted: 'Contato Realizado',
  proposal_sent: 'Proposta Enviada',
  negotiation: 'Negociação',
  won: 'Fechado Ganho',
  lost: 'Fechado Perdido',
}

export const PIPELINE_STAGE_COLORS: Record<DealStage, string> = {
  new_lead: 'bg-blue-500/10 text-blue-400',
  contacted: 'bg-yellow-500/10 text-yellow-400',
  proposal_sent: 'bg-orange-500/10 text-orange-400',
  negotiation: 'bg-purple-500/10 text-purple-400',
  won: 'bg-emerald-500/10 text-emerald-400',
  lost: 'bg-red-500/10 text-red-400',
}
