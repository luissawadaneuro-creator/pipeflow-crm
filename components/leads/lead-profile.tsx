import { Mail, Phone, Building2, Briefcase, User, Calendar } from 'lucide-react'
import { LeadStatusBadge } from '@/components/leads/lead-status-badge'
import type { Lead, Member } from '@/types'

function Row({ icon: Icon, label, value }: {
  icon: React.ElementType
  label: string
  value: string | null | undefined
}) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 w-7 h-7 rounded-md bg-secondary flex items-center justify-center shrink-0">
        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm text-foreground mt-0.5">{value}</p>
      </div>
    </div>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

interface LeadProfileProps {
  lead: Lead
  members: Member[]
}

export function LeadProfile({ lead, members }: LeadProfileProps) {
  function initials(name: string) {
    return name.split(' ').filter(Boolean).slice(0, 2).map((n) => n[0]).join('').toUpperCase()
  }

  const assignee = members.find((m) => m.user_id === lead.assigned_to)
  const assigneeLabel = assignee?.full_name || assignee?.email || lead.assigned_to

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-5">
      {/* Avatar + name + status */}
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
          <span className="text-lg font-bold text-primary">{initials(lead.name)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-foreground">{lead.name}</h2>
          {lead.role && (
            <p className="text-sm text-muted-foreground">{lead.role}</p>
          )}
          <div className="mt-2">
            <LeadStatusBadge status={lead.status} />
          </div>
        </div>
      </div>

      <div className="border-t border-border" />

      {/* Contact info */}
      <div className="space-y-3">
        <Row icon={Mail} label="E-mail" value={lead.email} />
        <Row icon={Phone} label="Telefone" value={lead.phone} />
        <Row icon={Building2} label="Empresa" value={lead.company} />
        <Row icon={Briefcase} label="Cargo" value={lead.role} />
        <Row icon={User} label="Responsável" value={assigneeLabel} />
        <Row icon={Calendar} label="Criado em" value={formatDate(lead.created_at)} />
      </div>
    </div>
  )
}
