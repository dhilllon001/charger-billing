import { cn } from '@/lib/cn'

type ColumnFilterCellProps = {
  filterKey: string
  type: 'text' | 'range'
  value: string | { min?: string; max?: string } | undefined
  onApply: (key: string, value: string | { min?: string; max?: string } | undefined) => void
  align?: 'left' | 'right'
}

export function ColumnFilterCell({ filterKey, type, value, onApply, align }: ColumnFilterCellProps) {
  if (type === 'text') {
    const text = typeof value === 'string' ? value : ''
    return (
      <input
        type="text"
        className={cn('sr-ag-filter-input', align === 'right' && 'sr-ag-filter-input--right')}
        placeholder="Filter…"
        value={text}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => onApply(filterKey, e.target.value.trim() || undefined)}
      />
    )
  }

  const range = typeof value === 'object' && value ? value : {}
  return (
    <div className={cn('sr-ag-filter-range', align === 'right' && 'sr-ag-filter-range--right')}>
      <input
        type="text"
        className="sr-ag-filter-input sr-ag-filter-input--compact"
        placeholder="Min"
        value={range.min ?? ''}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => {
          const next = { ...range, min: e.target.value || undefined }
          onApply(filterKey, next.min || next.max ? next : undefined)
        }}
      />
      <span className="sr-ag-filter-range__sep">–</span>
      <input
        type="text"
        className="sr-ag-filter-input sr-ag-filter-input--compact"
        placeholder="Max"
        value={range.max ?? ''}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => {
          const next = { ...range, max: e.target.value || undefined }
          onApply(filterKey, next.min || next.max ? next : undefined)
        }}
      />
    </div>
  )
}
