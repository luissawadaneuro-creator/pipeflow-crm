import type { LucideIcon } from 'lucide-react'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'

interface MetricCardProps {
  label: string
  value: string
  icon: LucideIcon
  change?: number
}

export function MetricCard({ label, value, icon: Icon, change }: MetricCardProps) {
  const isPositive = (change ?? 0) >= 0

  return (
    <div
      className="rounded-lg p-4"
      style={{
        background: 'var(--pf-surface)',
        border: '1px solid var(--pf-border)',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <span
          className="text-[11px] uppercase tracking-[0.12em] font-medium"
          style={{
            fontFamily: 'var(--font-ibm-plex-mono), monospace',
            color: 'var(--pf-text-secondary)',
          }}
        >
          {label}
        </span>
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
          style={{ background: 'rgba(202,255,51,0.1)' }}
        >
          <Icon className="w-3.5 h-3.5" style={{ color: 'var(--pf-accent)' }} />
        </div>
      </div>

      <p
        className="text-2xl font-semibold tracking-tight"
        style={{ color: 'var(--pf-text)' }}
      >
        {value}
      </p>

      {change !== undefined && (
        <div className="flex items-center gap-1 mt-1.5">
          {isPositive ? (
            <ArrowUpRight className="w-3 h-3" style={{ color: '#2ED573' }} />
          ) : (
            <ArrowDownRight className="w-3 h-3" style={{ color: '#FF4757' }} />
          )}
          <span
            className="text-[11px]"
            style={{
              fontFamily: 'var(--font-ibm-plex-mono), monospace',
              color: isPositive ? '#2ED573' : '#FF4757',
            }}
          >
            {isPositive ? '+' : ''}{change}% vs. mês anterior
          </span>
        </div>
      )}
    </div>
  )
}
