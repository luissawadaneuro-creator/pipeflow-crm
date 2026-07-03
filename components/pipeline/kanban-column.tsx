'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DealCard } from '@/components/pipeline/deal-card'
import type { Deal, DealStage } from '@/types'

export const STAGE_CONFIG: Record<DealStage, {
  label: string
  color: string    // CSS color value for dot + accents
  badgeBg: string  // inline background for badge
  glowColor: string // rgba for card hover shadow
}> = {
  new_lead: {
    label: 'Novo Lead',
    color: '#5B7FFF',
    badgeBg: 'rgba(91,127,255,0.12)',
    glowColor: 'rgba(91,127,255,0.18)',
  },
  contacted: {
    label: 'Contatado',
    color: '#00B4D8',
    badgeBg: 'rgba(0,180,216,0.12)',
    glowColor: 'rgba(0,180,216,0.18)',
  },
  proposal_sent: {
    label: 'Proposta Enviada',
    color: '#CAFF33',
    badgeBg: 'rgba(202,255,51,0.1)',
    glowColor: 'rgba(202,255,51,0.14)',
  },
  negotiation: {
    label: 'Negociação',
    color: '#FF6B35',
    badgeBg: 'rgba(255,107,53,0.12)',
    glowColor: 'rgba(255,107,53,0.18)',
  },
  won: {
    label: 'Fechado Ganho',
    color: '#2ED573',
    badgeBg: 'rgba(46,213,115,0.12)',
    glowColor: 'rgba(46,213,115,0.18)',
  },
  lost: {
    label: 'Fechado Perdido',
    color: '#FF4757',
    badgeBg: 'rgba(255,71,87,0.12)',
    glowColor: 'rgba(255,71,87,0.18)',
  },
}

const STAGE_ORDER: DealStage[] = ['new_lead', 'contacted', 'proposal_sent', 'negotiation', 'won', 'lost']

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
  const staggerIndex = STAGE_ORDER.indexOf(stage)

  return (
    <div
      className="flex flex-col w-72 shrink-0 h-full animate-column-enter"
      style={{ animationDelay: `${staggerIndex * 60}ms` }}
    >
      {/* Column header */}
      <div
        className="rounded-lg p-3 mb-3"
        style={{
          background: 'var(--pf-surface)',
          borderTop: `2px solid ${cfg.color}`,
          borderLeft: '1px solid var(--pf-border)',
          borderRight: '1px solid var(--pf-border)',
          borderBottom: '1px solid var(--pf-border)',
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {/* Stage dot */}
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: cfg.color }}
            />
            {/* Label in mono uppercase */}
            <span
              className="text-[11px] uppercase tracking-[0.12em] font-medium"
              style={{
                fontFamily: 'var(--font-ibm-plex-mono), monospace',
                color: 'var(--pf-text-secondary)',
              }}
            >
              {cfg.label}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Count badge */}
            <span
              className="text-[10px] font-medium px-1.5 py-0.5 rounded"
              style={{
                fontFamily: 'var(--font-ibm-plex-mono), monospace',
                background: cfg.badgeBg,
                color: cfg.color,
              }}
            >
              {deals.length}
            </span>
            <button
              onClick={() => onAddDeal(stage)}
              className="w-6 h-6 rounded flex items-center justify-center transition-colors"
              style={{ color: 'var(--pf-text-muted)' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'var(--pf-text)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--pf-text-muted)')}
              aria-label={`Adicionar negócio em ${cfg.label}`}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Total value */}
        <p
          className="text-[11px]"
          style={{
            fontFamily: 'var(--font-ibm-plex-mono), monospace',
            color: totalValue > 0 ? cfg.color : 'var(--pf-text-muted)',
          }}
        >
          {totalValue > 0 ? formatBRL(totalValue) : '—'}
        </p>
      </div>

      {/* Drop zone */}
      <SortableContext items={dealIds} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={cn(
            'flex-1 flex flex-col gap-2 rounded-lg min-h-[120px] transition-colors duration-150 p-1',
            isOver && 'ring-1',
          )}
          style={isOver ? {
            background: 'rgba(202,255,51,0.03)',
            outline: '1px solid rgba(202,255,51,0.2)',
          } : undefined}
        >
          {deals.map(deal => (
            <DealCard
              key={deal.id}
              deal={deal}
              onEdit={onEditDeal}
              stageColor={cfg.color}
              stageGlow={cfg.glowColor}
            />
          ))}

          {deals.length === 0 && (
            <div
              className="flex-1 rounded-lg border border-dashed flex items-center justify-center min-h-[80px]"
              style={{
                borderColor: isOver ? 'rgba(202,255,51,0.3)' : 'var(--pf-border)',
                background: isOver ? 'rgba(202,255,51,0.03)' : 'transparent',
              }}
            >
              <p
                className="text-[10px] uppercase tracking-[0.1em]"
                style={{
                  fontFamily: 'var(--font-ibm-plex-mono), monospace',
                  color: 'var(--pf-text-muted)',
                }}
              >
                Arraste aqui
              </p>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  )
}
