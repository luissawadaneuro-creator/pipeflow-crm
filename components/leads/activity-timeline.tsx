import { Phone, Mail, Calendar, FileText } from 'lucide-react'
import type { ActivityType } from '@/types'

const ACTIVITY_CONFIG: Record<ActivityType, {
  label: string
  icon: React.ElementType
  color: string
  bg: string
}> = {
  call: {
    label: 'Ligação',
    icon: Phone,
    color: 'text-blue-400',
    bg: 'bg-blue-500/15',
  },
  email: {
    label: 'E-mail',
    icon: Mail,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/15',
  },
  meeting: {
    label: 'Reunião',
    icon: Calendar,
    color: 'text-purple-400',
    bg: 'bg-purple-500/15',
  },
  note: {
    label: 'Nota',
    icon: FileText,
    color: 'text-slate-400',
    bg: 'bg-slate-500/15',
  },
}

interface ActivityItem {
  id: string
  lead_id: string
  type: ActivityType
  description: string
  author: string
  date: string
}

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86_400_000)
  if (days === 0) return 'Hoje'
  if (days === 1) return 'Ontem'
  if (days < 7) return `${days} dias atrás`
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

interface ActivityTimelineProps {
  activities: ActivityItem[]
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  if (activities.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">Nenhuma atividade registrada ainda.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card divide-y divide-border">
      {activities.map((activity, idx) => {
        const config = ACTIVITY_CONFIG[activity.type]
        const Icon = config.icon
        const isLast = idx === activities.length - 1

        return (
          <div key={activity.id} className="flex gap-4 p-4">
            {/* Icon + vertical line */}
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-4 h-4 ${config.color}`} />
              </div>
              {!isLast && <div className="w-px flex-1 bg-border mt-2" />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pb-1">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className={`text-xs font-semibold ${config.color}`}>{config.label}</span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {formatRelative(activity.date)} · {formatTime(activity.date)}
                </span>
              </div>
              <p className="text-sm text-foreground leading-relaxed">{activity.description}</p>
              <p className="text-xs text-muted-foreground mt-1.5">por {activity.author}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
