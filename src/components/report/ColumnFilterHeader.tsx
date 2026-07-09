import { useState, useEffect, useRef } from 'react'
import { Filter } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/Button'

type ColFilterType = 'text' | 'range'

type ColumnFilterHeaderProps = {
  label: string
  filterKey: string
  type: ColFilterType
  value: string | { min?: string; max?: string } | undefined
  onApply: (key: string, value: string | { min?: string; max?: string } | undefined) => void
}

export function ColumnFilterHeader({ label, filterKey, type, value, onApply }: ColumnFilterHeaderProps) {
  const [open, setOpen] = useState(false)
  const [draftText, setDraftText] = useState('')
  const [draftMin, setDraftMin] = useState('')
  const [draftMax, setDraftMax] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  const isActive =
    (typeof value === 'string' && value.trim() !== '') ||
    (typeof value === 'object' && value && (value.min || value.max))

  useEffect(() => {
    if (open) {
      if (typeof value === 'string') setDraftText(value)
      else if (typeof value === 'object' && value) {
        setDraftMin(value.min ?? '')
        setDraftMax(value.max ?? '')
      } else {
        setDraftText('')
        setDraftMin('')
        setDraftMax('')
      }
    }
  }, [open, value])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClick)
    }
  }, [open])

  const handleApply = () => {
    if (type === 'text') {
      onApply(filterKey, draftText.trim() || undefined)
    } else {
      const next = { min: draftMin || undefined, max: draftMax || undefined }
      onApply(filterKey, next.min || next.max ? next : undefined)
    }
    setOpen(false)
  }

  const handleClear = () => {
    onApply(filterKey, undefined)
    setDraftText('')
    setDraftMin('')
    setDraftMax('')
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative inline-flex items-center">
      <span>{label}</span>
      <button
        type="button"
        className={cn('sr-col-filter-btn', isActive && 'is-active')}
        onClick={(e) => {
          e.stopPropagation()
          setOpen((v) => !v)
        }}
        aria-label={`Filter ${label}`}
      >
        <Filter size={12} strokeWidth={2} />
      </button>
      {open && (
        <div className="sr-col-filter-popover" onClick={(e) => e.stopPropagation()}>
          {type === 'text' ? (
            <input
              autoFocus
              placeholder="Contains…"
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleApply()}
            />
          ) : (
            <div className="space-y-2">
              <input placeholder="Min" value={draftMin} onChange={(e) => setDraftMin(e.target.value)} />
              <input placeholder="Max" value={draftMax} onChange={(e) => setDraftMax(e.target.value)} />
            </div>
          )}
          <div className="mt-2 flex gap-2">
            <Button variant="primary" size="sm" className="!h-7 flex-1 !text-[11px]" onClick={handleApply}>
              Apply
            </Button>
            <Button variant="ghost" size="sm" className="!h-7 !text-[11px]" onClick={handleClear}>
              Clear
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
