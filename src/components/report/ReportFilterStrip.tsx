import { X } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export type FilterStripItem = {
  key: string
  label: string
  active?: boolean
  onClick?: () => void
  onClear?: () => void
}

type ReportFilterStripProps = {
  items: FilterStripItem[]
  activeCount?: number
  onReset?: () => void
  children?: React.ReactNode
}

function SrFilterChip({ label, active, onClick, onClear }: Omit<FilterStripItem, 'key'>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`sr-filter-chip${active ? ' is-active' : ''}`}
    >
      {label}
      {active && onClear && (
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation()
            onClear()
          }}
          onKeyDown={(e) => e.key === 'Enter' && onClear()}
          className="ml-0.5 flex rounded-full p-0.5 hover:bg-white/20"
        >
          <X size={11} strokeWidth={2.5} />
        </span>
      )}
    </button>
  )
}

export function ReportFilterStrip({ items, activeCount = 0, onReset, children }: ReportFilterStripProps) {
  return (
    <div className="sr-filter-strip">
      {children}
      {items.map((item) => (
        <SrFilterChip key={item.key} label={item.label} active={item.active} onClick={item.onClick} onClear={item.onClear} />
      ))}
      {activeCount > 0 && onReset && (
        <Button variant="ghost" size="sm" onClick={onReset} className="!h-7 !text-[12px] !border-[var(--sr-border-2)]">
          Reset ({activeCount})
        </Button>
      )}
    </div>
  )
}
