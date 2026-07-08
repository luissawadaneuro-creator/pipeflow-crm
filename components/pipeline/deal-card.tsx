'use client'

import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Calendar, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DealWithLead } from '@/lib/supabase/queries'
import type { Member } from '@/types'

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
  deal: DealWithLead
  onEdit: (deal: DealWithLead) => void
  overlay?: boolean
  stageColor?: string
  stageGlow?: string
  members?: Member[]
}

export function DealCard({ deal, onEdit, overlay = false, stageColor, stageGlow, members = [] }: DealCardProps) {
  const [hovered, setHovered] = useState(false)

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

  const isHoverActive = hovered && !isDragging && !overlay

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    background: 'var(--pf-surface)',
    borderColor: isHoverActive && stageColor
      ? `rgba(${hexToRgb(stageColor)},0.3)`
      : 'var(--pf-border)',
    ...(isHoverActive && stageGlow ? {
      boxShadow: `0 4px 20px -4px ${stageGlow}`,
    } : {}),
  }

  const lead = deal.lead
  const assignee = members.find(m => m.user_id === deal.assigned_to)
  const assigneeLabel = assignee?.full_name || assignee?.email || deal.assigned_to

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'group relative rounded-lg border transition-all duration-200 select-none overflow-hidden',
        !overlay && 'cursor-grab active:cursor-grabbing',
        isDragging && !overlay && 'opacity-40 border-dashed',
        overlay && 'shadow-2xl rotate-[1.5deg] scale-[1.02] opacity-95 cursor-grabbing',
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => { if (!isDragging) onEdit(deal) }}
    >
      {/* Top accent bar on hover */}
      {isHoverActive && stageColor && (
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: stageColor }}
        />
      )}

      {/* Drag handle — decorative */}
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none">
        <GripVertical className="w-3.5 h-3.5" style={{ color: 'var(--pf-text-muted)' }} />
      </div>

      <div className="p-3 space-y-2">
        {/* Title */}
        <p
          className="text-sm font-medium leading-snug pr-5 line-clamp-2"
          style={{ color: 'var(--pf-text)' }}
        >
          {deal.title}
        </p>

        {/* Value in mono, stage color */}
        <p
          className="text-sm font-semibold tracking-tight"
          style={{
            fontFamily: 'var(--font-ibm-plex-mono), monospace',
            color: stageColor ?? 'var(--pf-accent)',
          }}
        >
          {formatBRL(deal.value)}
        </p>

        {/* Lead chip */}
        {lead && (
          <div className="flex items-center gap-1.5">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'rgba(202,255,51,0.1)' }}
            >
              <span
                className="text-[9px] font-bold"
                style={{ color: 'var(--pf-accent)', fontFamily: 'var(--font-ibm-plex-mono), monospace' }}
              >
                {initials(lead.name)}
              </span>
            </div>
            <span
              className="text-xs truncate"
              style={{ color: 'var(--pf-text-muted)' }}
            >
              {lead.name}{lead.company ? ` · ${lead.company}` : ''}
            </span>
          </div>
        )}

        {/* Footer: responsible + deadline */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          {deal.assigned_to ? (
            <div className="flex items-center gap-1.5">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                style={{ background: 'var(--pf-surface-2)' }}
              >
                <User className="w-3 h-3" style={{ color: 'var(--pf-text-muted)' }} />
              </div>
              <span
                className="text-[11px] truncate max-w-[80px]"
                style={{ color: 'var(--pf-text-muted)', fontFamily: 'var(--font-ibm-plex-mono), monospace' }}
              >
                {assigneeLabel?.split(' ')[0]}
              </span>
            </div>
          ) : (
            <span />
          )}

          {deal.deadline && (() => {
            const { label, urgent, overdue } = formatDeadline(deal.deadline)
            return (
              <div
                className="flex items-center gap-1 rounded px-1.5 py-0.5 pointer-events-none"
                style={{
                  fontFamily: 'var(--font-ibm-plex-mono), monospace',
                  fontSize: '10px',
                  background: overdue
                    ? 'rgba(255,71,87,0.1)'
                    : urgent
                    ? 'rgba(255,107,53,0.1)'
                    : 'var(--pf-surface-2)',
                  color: overdue
                    ? '#FF4757'
                    : urgent
                    ? '#FF6B35'
                    : 'var(--pf-text-muted)',
                }}
              >
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

function hexToRgb(hex: string): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `${r},${g},${b}`
}
