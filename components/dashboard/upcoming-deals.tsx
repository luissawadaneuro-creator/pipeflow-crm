import { Calendar } from 'lucide-react'
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

function formatDeadline(iso: string, now: Date): { label: string; urgent: boolean; overdue: boolean } {
  const deadline = new Date(iso)
  const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / 86_400_000)

  if (diffDays < 0) return { label: `${Math.abs(diffDays)}d em atraso`, urgent: false, overdue: true }
  if (diffDays === 0) return { label: 'Hoje', urgent: true, overdue: false }
  if (diffDays === 1) return { label: 'Amanhã', urgent: true, overdue: false }
  return { label: `Em ${diffDays}d`, urgent: true, overdue: false }
}

interface UpcomingDealsProps {
  deals: Deal[]
  now?: Date
}

export function UpcomingDeals({ deals, now = new Date() }: UpcomingDealsProps) {
  return (
    <div
      className="rounded-lg p-4"
      style={{
        background: 'var(--pf-surface)',
        border: '1px solid var(--pf-border)',
      }}
    >
      <h2
        className="text-[11px] uppercase tracking-[0.12em] font-medium mb-4"
        style={{
          fontFamily: 'var(--font-ibm-plex-mono), monospace',
          color: 'var(--pf-text-secondary)',
        }}
      >
        Prazos Próximos
      </h2>

      {deals.length === 0 ? (
        <p
          className="text-sm py-6 text-center"
          style={{ color: 'var(--pf-text-muted)' }}
        >
          Nenhum negócio com prazo nos próximos 7 dias.
        </p>
      ) : (
        <div className="space-y-1">
          {deals.map(deal => {
            const lead = MOCK_LEADS.find(l => l.id === deal.lead_id)
            const { label, urgent, overdue } = formatDeadline(deal.deadline as string, now)

            return (
              <div
                key={deal.id}
                className="flex items-center justify-between gap-3 py-2.5"
                style={{ borderBottom: '1px solid var(--pf-border-subtle)' }}
              >
                <div className="min-w-0 flex-1">
                  <p
                    className="text-sm font-medium truncate"
                    style={{ color: 'var(--pf-text)' }}
                  >
                    {deal.title}
                  </p>
                  <p
                    className="text-xs truncate"
                    style={{ color: 'var(--pf-text-muted)' }}
                  >
                    {lead ? `${lead.name}${lead.company ? ` · ${lead.company}` : ''}` : deal.assigned_to}
                  </p>
                </div>

                <p
                  className="text-sm font-semibold shrink-0"
                  style={{
                    fontFamily: 'var(--font-ibm-plex-mono), monospace',
                    color: 'var(--pf-accent)',
                  }}
                >
                  {formatBRL(deal.value)}
                </p>

                <div
                  className="flex items-center gap-1 rounded px-2 py-1 shrink-0"
                  style={{
                    fontFamily: 'var(--font-ibm-plex-mono), monospace',
                    fontSize: '11px',
                    background: overdue ? 'rgba(255,71,87,0.1)' : 'rgba(255,107,53,0.1)',
                    color: overdue ? '#FF4757' : '#FF6B35',
                  }}
                >
                  <Calendar className="w-3 h-3" />
                  {label}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
