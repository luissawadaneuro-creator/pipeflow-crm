import { cn } from '@/lib/utils'

type LogoSize = 'sm' | 'md' | 'lg'

interface LogoProps {
  size?: LogoSize
  className?: string
}

const sizeMap: Record<LogoSize, {
  mark: string
  markText: string
  name: string
  tag: string
}> = {
  sm: { mark: 'w-6 h-6 rounded-[4px] text-xs',  markText: 'text-xs',  name: 'text-sm',   tag: 'text-[9px]' },
  md: { mark: 'w-8 h-8 rounded-[6px] text-sm',   markText: 'text-sm',  name: 'text-base', tag: 'text-[10px]' },
  lg: { mark: 'w-10 h-10 rounded-[8px] text-base', markText: 'text-base', name: 'text-xl', tag: 'text-xs' },
}

export function Logo({ size = 'md', className }: LogoProps) {
  const s = sizeMap[size]

  return (
    <div className={cn('flex items-center gap-2.5 select-none', className)}>
      {/* Square mark */}
      <div
        className={cn(
          'flex items-center justify-center shrink-0 font-extrabold leading-none',
          s.mark,
        )}
        style={{
          background: 'var(--pf-accent)',
          color: 'var(--pf-bg)',
          fontFamily: 'var(--font-syne), sans-serif',
        }}
      >
        P
      </div>

      {/* Wordmark */}
      <div className="flex flex-col leading-none gap-0.5">
        <span
          className={cn('font-semibold tracking-tight leading-none', s.name)}
          style={{
            fontFamily: 'var(--font-syne), sans-serif',
            color: 'var(--pf-text)',
          }}
        >
          PipeFlow
        </span>
        <span
          className={cn('uppercase tracking-[0.15em] leading-none', s.tag)}
          style={{
            fontFamily: 'var(--font-ibm-plex-mono), monospace',
            color: 'var(--pf-text-muted)',
          }}
        >
          CRM
        </span>
      </div>
    </div>
  )
}
