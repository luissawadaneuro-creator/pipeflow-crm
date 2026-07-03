import { cn } from '@/lib/utils'

type LogoSize = 'sm' | 'md' | 'lg'

interface LogoProps {
  size?: LogoSize
  className?: string
}

const sizeMap: Record<LogoSize, { text: string; line: string }> = {
  sm: { text: 'text-base',  line: 'h-[2px] w-10 mt-0.5' },
  md: { text: 'text-xl',    line: 'h-[2px] w-14 mt-1' },
  lg: { text: 'text-3xl',   line: 'h-[2.5px] w-20 mt-1.5' },
}

export function Logo({ size = 'md', className }: LogoProps) {
  const { text, line } = sizeMap[size]

  return (
    <div className={cn('flex flex-col items-start select-none', className)}>
      <span
        className={cn('font-extrabold tracking-tight leading-none', text)}
        style={{ fontFamily: 'var(--font-syne), sans-serif' }}
      >
        <span className="text-foreground">Pipe</span>
        <span style={{ color: 'var(--accent-lime)' }}>Flow</span>
      </span>
      {/* Animated bottom line */}
      <div
        className={cn('rounded-full origin-left animate-flow-pulse', line)}
        style={{ background: 'var(--accent-lime)' }}
      />
    </div>
  )
}
