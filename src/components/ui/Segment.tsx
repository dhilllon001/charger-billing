import { cn } from '@/lib/cn'

export interface SegmentItem {
  id: string
  label: string
  count?: number
  subItems?: { id: string; label: string }[]
}

interface SegmentProps {
  items: SegmentItem[]
  value: string
  onChange: (id: string) => void
  className?: string
}

export function Segment({ items, value, onChange, className }: SegmentProps) {
  return (
    <div className={cn('inline-flex rounded-xl bg-black/[0.055] p-1', className)}>
      {items.map((item) => {
        const active = value === item.id || item.subItems?.some((s) => s.id === value)
        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={cn(
              'relative flex items-center gap-1.5 rounded-[10px] px-3 py-1.5 text-[12px] font-medium transition-all duration-200 ease-[var(--ease-apple)]',
              active ? 'bg-white text-ink shadow-[var(--shadow-rest)]' : 'text-ink-2 hover:text-ink'
            )}
          >
            {item.label}
            {item.count != null && (
              <span className={cn('rounded-full px-1.5 py-px text-[10px] font-semibold tabular-nums', active ? 'bg-black/[0.06] text-ink-2' : 'text-ink-3')}>
                {item.count.toLocaleString()}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
