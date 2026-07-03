'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Calendar, User, CircleDollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MOCK_LEADS } from '@/lib/mock-leads'
import type { Deal } from '@/types'

function formatBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDeadline(iso: string): { label: string; urgent: boolean; overdue: boolean } {
  const deadline = new Date(iso)
  const now = new Date()
  const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / 86_400_000)

  if (diffDays < 0) return { label: `${Math.abs(diffDays)}d atraso`, urgent: false, overdue: true }
  if (diffDays === 0) return { label: 'Hoje', urgent: true, overdue: false }
  if (diffDays === 1) return { label: 'Amanhã', urgent: true, overdue: false }
  if (diffDays <= 7) return { label: `${diffDays}d`, urgent: true, overdue: false }
  return {
    label: deadline.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
    urgent: false,
    overdue: false,
  }
}

function initials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

interface DealCardProps {
  deal: Deal
  onEdit: (deal: Deal) => void
  overlay?: boolean
}

export function DealCard({ deal, onEdit, overlay = false }: DealCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: deal.id,
    data: { deal },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const lead = MOCK_LEADS.find(l => l.id === deal.lead_id)

  return (
    <div
      ref={setNodeRef}
      style={style}
      // Listeners on the whole card so any area can initiate drag
      {...attributes}
      {...listeners}
      className={cn(
        'group relative rounded-xl border bg-card transition-all duration-150 select-none',
        'border-border hover:border-slate-700',
        'shadow-sm hover:shadow-md hover:shadow-black/20',
        // cursor: grab while not dragging, grabbing while dragging
        !overlay && 'cursor-grab active:cursor-grabbing',
        isDragging && !overlay && 'opacity-40 border-dashed',
        overlay && 'shadow-2xl shadow-black/40 rotate-[1.5deg] scale-[1.02] border-slate-600 opacity-95 cursor-grabbing',
      )}
      // Only open form on a genuine click (no movement = not a drag)
      onClick={() => {
        if (!isDragging) onEdit(deal)
      }}
    >
      {/* Left accent stripe on hover */}
      <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      {/* Drag handle indicator — purely decorative, visible on hover */}
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-40 transition-opacity pointer-events-none">
        <GripVertical className="w-3.5 h-3.5 text-muted-foreground" />
      </div>

      <div className="p-3 space-y-2.5">
        {/* Title */}
        <p className="text-sm font-medium text-foreground leading-snug pr-5 line-clamp-2">
          {deal.title}
        </p>

        {/* Value */}
        <div className="flex items-center gap-1.5">
          <CircleDollarSign className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span className="text-sm font-semibold text-blue-400 font-mono tracking-tight">
            {formatBRL(deal.value)}
          </span>
        </div>

        {/* Lead chip */}
        {lead && (
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <span className="text-[9px] font-bold text-primary">{initials(lead.name)}</span>
            </div>
            <span className="text-xs text-muted-foreground truncate">
              {lead.name}{lead.company ? ` · ${lead.company}` : ''}
            </span>
          </div>
        )}

        {/* Footer: responsible + deadline */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          {deal.assigned_to ? (
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
                <User className="w-3 h-3 text-slate-400" />
              </div>
              <span className="text-xs text-muted-foreground truncate max-w-[80px]">
                {deal.assigned_to.split(' ')[0]}
              </span>
            </div>
          ) : (
            <span />
          )}

          {deal.deadline && (() => {
            const { label, urgent, overdue } = formatDeadline(deal.deadline)
            return (
              <div className={cn(
                'flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium pointer-events-none',
                overdue && 'bg-red-500/15 text-red-400',
                urgent && !overdue && 'bg-amber-500/15 text-amber-400',
                !urgent && !overdue && 'bg-slate-700/60 text-muted-foreground',
              )}>
                <Calendar className="w-2.5 h-2.5" />
                {label}
              </div>
            )
          })()}
        </div>
      </div>
    </div>
  )
}
