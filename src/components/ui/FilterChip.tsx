import { X } from 'lucide-react'
import { cn } from '@/lib/cn'

interface FilterChipProps {
  label: string
  active?: boolean
  onClick?: () => void
  onClear?: () => void
}

export function FilterChip({ label, active, onClick, onClear }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[12px] font-medium transition-all duration-150',
        active ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink-2 hover:border-line-strong'
      )}
    >
      {label}
      {active && onClear && (
        <span
          onClick={(e) => { e.stopPropagation(); onClear() }}
          className="ml-0.5 rounded-full p-0.5 hover:bg-white/20"
        >
          <X size={12} strokeWidth={1.7} />
        </span>
      )}
    </button>
  )
}
