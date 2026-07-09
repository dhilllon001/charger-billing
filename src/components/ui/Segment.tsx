import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
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
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 280 })
  const ref = useRef<HTMLDivElement>(null)
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  const updatePosition = useCallback((id: string) => {
    const btn = btnRefs.current[id]
    if (!btn) return
    const rect = btn.getBoundingClientRect()
    setDropdownPos({
      top: rect.bottom + 6,
      left: rect.left,
      width: Math.max(rect.width, 280),
    })
  }, [])

  useEffect(() => {
    const close = (e: MouseEvent) => {
      const target = e.target as Node
      if (ref.current?.contains(target)) return
      const portal = document.getElementById('segment-dropdown-portal')
      if (portal?.contains(target)) return
      setOpenId(null)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  useEffect(() => {
    if (!openId) return
    const onScroll = () => updatePosition(openId)
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onScroll)
    }
  }, [openId, updatePosition])

  const openItem = items.find((i) => i.id === openId)

  return (
    <div ref={ref} className={cn('sr-segment', className)}>
      {items.map((item) => {
        const active = value === item.id || item.subItems?.some((s) => s.id === value)
        const hasSub = item.subItems && item.subItems.length > 0

        return (
          <div key={item.id} className="relative shrink-0">
            <button
              ref={(el) => { btnRefs.current[item.id] = el }}
              type="button"
              onClick={() => {
                if (hasSub) {
                  const next = openId === item.id ? null : item.id
                  setOpenId(next)
                  if (next) {
                    requestAnimationFrame(() => updatePosition(next))
                  }
                } else {
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
          </div>
        )
      })}

      {openId && openItem?.subItems &&
        createPortal(
          <div
            id="segment-dropdown-portal"
            className="sr-segment__dropdown sr-segment__dropdown--portal"
            style={{
              position: 'fixed',
              top: dropdownPos.top,
              left: dropdownPos.left,
              minWidth: dropdownPos.width,
              zIndex: 10060,
            }}
          >
            {openItem.subItems.map((sub) => (
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
          </div>,
          document.body
        )}
    </div>
  )
}
