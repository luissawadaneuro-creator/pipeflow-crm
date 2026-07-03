'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DealCard } from '@/components/pipeline/deal-card'
import type { Deal, DealStage } from '@/types'

export const STAGE_CONFIG: Record<DealStage, {
  label: string
  accent: string        // border-t color class
  badge: string         // badge bg+text
  headerGlow: string    // subtle bg tint
  dot: string           // dot color
}> = {
  new_lead: {
    label: 'Novo Lead',
    accent: 'border-t-slate-500',
    badge: 'bg-slate-700 text-slate-300',
    headerGlow: 'bg-slate-500/5',
    dot: 'bg-slate-400',
  },
  contacted: {
    label: 'Contatado',
    accent: 'border-t-blue-500',
    badge: 'bg-blue-500/20 text-blue-300',
    headerGlow: 'bg-blue-500/5',
    dot: 'bg-blue-400',
  },
  proposal_sent: {
    label: 'Proposta Enviada',
    accent: 'border-t-violet-500',
    badge: 'bg-violet-500/20 text-violet-300',
    headerGlow: 'bg-violet-500/5',
    dot: 'bg-violet-400',
  },
  negotiation: {
    label: 'Negociação',
    accent: 'border-t-amber-500',
    badge: 'bg-amber-500/20 text-amber-300',
    headerGlow: 'bg-amber-500/5',
    dot: 'bg-amber-400',
  },
  won: {
    label: 'Fechado Ganho',
    accent: 'border-t-emerald-500',
    badge: 'bg-emerald-500/20 text-emerald-300',
    headerGlow: 'bg-emerald-500/5',
    dot: 'bg-emerald-400',
  },
  lost: {
    label: 'Fechado Perdido',
    accent: 'border-t-red-500',
    badge: 'bg-red-500/20 text-red-300',
    headerGlow: 'bg-red-500/5',
    dot: 'bg-red-400',
  },
}

function formatBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

interface KanbanColumnProps {
  stage: DealStage
  deals: Deal[]
  onAddDeal: (stage: DealStage) => void
  onEditDeal: (deal: Deal) => void
}

export function KanbanColumn({ stage, deals, onAddDeal, onEditDeal }: KanbanColumnProps) {
  const cfg = STAGE_CONFIG[stage]
  const { setNodeRef, isOver } = useDroppable({ id: stage })

  const totalValue = deals.reduce((sum, d) => sum + d.value, 0)
  const dealIds = deals.map(d => d.id)

  return (
    <div className="flex flex-col w-72 shrink-0 h-full">
      {/* Column header */}
      <div className={cn(
        'rounded-xl border border-border border-t-2 p-3 mb-3',
        cfg.accent,
        cfg.headerGlow,
      )}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={cn('w-2 h-2 rounded-full', cfg.dot)} />
            <span className="text-sm font-semibold text-foreground">{cfg.label}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={cn('text-xs font-medium px-1.5 py-0.5 rounded-full', cfg.badge)}>
              {deals.length}
            </span>
            <button
              onClick={() => onAddDeal(stage)}
              className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
              aria-label={`Adicionar negócio em ${cfg.label}`}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <p className="text-xs font-mono text-muted-foreground">
          {totalValue > 0 ? formatBRL(totalValue) : '—'}
        </p>
      </div>

      {/* Drop zone */}
      <SortableContext items={dealIds} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={cn(
            'flex-1 flex flex-col gap-2 rounded-xl min-h-[120px] transition-colors duration-150 p-1',
            isOver && 'bg-primary/5 ring-1 ring-primary/20',
          )}
        >
          {deals.map(deal => (
            <DealCard key={deal.id} deal={deal} onEdit={onEditDeal} />
          ))}

          {deals.length === 0 && (
            <div className={cn(
              'flex-1 rounded-lg border border-dashed border-border flex items-center justify-center min-h-[80px]',
              isOver && 'border-primary/40 bg-primary/5',
            )}>
              <p className="text-xs text-muted-foreground/50">Arraste aqui</p>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  )
}
