import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'

export interface SegmentSubItem {
  id: string
  label: string
  count?: number
  variant?: 'success' | 'error'
}

export interface SegmentItem {
  id: string
  label: string
  count?: number
  subItems?: SegmentSubItem[]
}

interface SegmentProps {
  items: SegmentItem[]
  value: string
  onChange: (id: string) => void
  className?: string
}

export function Segment({ items, value, onChange, className }: SegmentProps) {
  const [openId, setOpenId] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpenId(null)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  return (
    <div ref={ref} className={cn('sr-segment', className)}>
      {items.map((item) => {
        const active = value === item.id || item.subItems?.some((s) => s.id === value)
        const hasSub = item.subItems && item.subItems.length > 0

        return (
          <div key={item.id} className="relative">
            <button
              type="button"
              onClick={() => {
                if (hasSub) setOpenId(openId === item.id ? null : item.id)
                else {
                  onChange(item.id)
                  setOpenId(null)
                }
              }}
              className={cn('sr-segment__btn', active && 'is-active')}
            >
              {item.label}
              {item.count != null && (
                <span className="sr-segment__count">{item.count.toLocaleString()}</span>
              )}
              {hasSub && (
                <ChevronDown
                  size={12}
                  strokeWidth={2}
                  className={cn('transition-transform', openId === item.id && 'rotate-180')}
                />
              )}
            </button>

            {hasSub && openId === item.id && (
              <div className="sr-segment__dropdown">
                {item.subItems!.map((sub) => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => {
                      onChange(sub.id)
                      setOpenId(null)
                    }}
                    className={cn(
                      'sr-segment__dropdown-item',
                      value === sub.id && 'is-active',
                      sub.variant === 'success' && 'is-success',
                      sub.variant === 'error' && 'is-error'
                    )}
                  >
                    {sub.label}
                    {sub.count != null && (
                      <span className="tabular-nums" style={{ color: 'var(--sr-text-meta)' }}>
                        {sub.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
