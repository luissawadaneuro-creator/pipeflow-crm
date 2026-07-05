'use client'

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { FunnelStagePoint } from '@/lib/mock-dashboard'

interface FunnelChartProps {
  data: FunnelStagePoint[]
}

function FunnelTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: FunnelStagePoint }> }) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload

  return (
    <div
      className="rounded-md px-3 py-2 text-xs"
      style={{
        background: 'var(--pf-surface-2)',
        border: '1px solid var(--pf-border)',
        fontFamily: 'var(--font-ibm-plex-mono), monospace',
      }}
    >
      <p style={{ color: point.color }}>{point.label}</p>
      <p style={{ color: 'var(--pf-text)' }}>{point.count} {point.count === 1 ? 'negócio' : 'negócios'}</p>
    </div>
  )
}

export function FunnelChart({ data }: FunnelChartProps) {
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
        Funil de Vendas
      </h2>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 24, bottom: 0, left: 0 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="label"
              width={130}
              tickLine={false}
              axisLine={false}
              tick={{
                fill: 'var(--pf-text-secondary)',
                fontSize: 11,
                fontFamily: 'var(--font-ibm-plex-mono), monospace',
              }}
            />
            <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} content={<FunnelTooltip />} />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={22}>
              {data.map(point => (
                <Cell key={point.stage} fill={point.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
