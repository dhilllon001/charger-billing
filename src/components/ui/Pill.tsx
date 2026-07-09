import { cn } from '@/lib/cn'

type PillVariant = 'green' | 'orange' | 'red' | 'blue' | 'gray' | 'ai'

const variants: Record<PillVariant, string> = {
  green: 'bg-green-soft text-green',
  orange: 'bg-orange-soft text-orange',
  red: 'bg-red-soft text-red',
  blue: 'bg-accent-soft text-accent',
  gray: 'bg-black/[0.05] text-ink-2',
  ai: 'ai-gradient text-white',
}

const dotColors: Record<PillVariant, string> = {
  green: 'bg-green',
  orange: 'bg-orange',
  red: 'bg-red',
  blue: 'bg-accent',
  gray: 'bg-ink-3',
  ai: 'bg-white',
}

interface PillProps {
  variant?: PillVariant
  children: React.ReactNode
  className?: string
  dot?: boolean
}

export function Pill({ variant = 'gray', children, className, dot = true }: PillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold leading-none',
        variants[variant],
        className
      )}
    >
      {dot && variant !== 'ai' && <span className={cn('h-[5px] w-[5px] rounded-full', dotColors[variant])} />}
      {variant === 'ai' && <span className="text-[10px]">✦</span>}
      {children}
    </span>
  )
}
