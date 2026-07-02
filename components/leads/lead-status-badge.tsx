import { cn } from '@/lib/utils'
import type { LeadStatus } from '@/types'

const STATUS_CONFIG: Record<LeadStatus, { label: string; className: string }> = {
  new: {
    label: 'Novo',
    className: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  },
  contacted: {
    label: 'Contatado',
    className: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  },
  qualified: {
    label: 'Qualificado',
    className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  },
  lost: {
    label: 'Perdido',
    className: 'bg-red-500/15 text-red-400 border-red-500/20',
  },
}

interface LeadStatusBadgeProps {
  status: LeadStatus
  className?: string
}

export function LeadStatusBadge({ status, className }: LeadStatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}

export { STATUS_CONFIG }
