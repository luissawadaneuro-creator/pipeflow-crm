import type { PipelineStage } from '@/types';

export const PIPELINE_STAGES = [
  'novo_lead',
  'contato_realizado',
  'proposta_enviada',
  'negociacao',
  'fechado_ganho',
  'fechado_perdido',
] as const satisfies readonly PipelineStage[];

export const PIPELINE_STAGE_LABELS: Record<PipelineStage, string> = {
  novo_lead: 'Novo Lead',
  contato_realizado: 'Contato Realizado',
  proposta_enviada: 'Proposta Enviada',
  negociacao: 'Negociação',
  fechado_ganho: 'Fechado Ganho',
  fechado_perdido: 'Fechado Perdido',
};

export const PIPELINE_STAGE_COLORS: Record<PipelineStage, string> = {
  novo_lead: 'bg-blue-100 text-blue-800',
  contato_realizado: 'bg-yellow-100 text-yellow-800',
  proposta_enviada: 'bg-orange-100 text-orange-800',
  negociacao: 'bg-purple-100 text-purple-800',
  fechado_ganho: 'bg-green-100 text-green-800',
  fechado_perdido: 'bg-red-100 text-red-800',
};
