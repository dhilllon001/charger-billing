import { useState, useRef, useEffect, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import { MoreVertical, Plus, Tag, FileCheck } from 'lucide-react'
import type { Order } from '@/data/models'
import { cn } from '@/lib/cn'

type MenuItem = {
  key: string
  icon: React.ReactNode
  label: string
  hint?: string
}

function countryLabel(currency?: string) {
  return currency === 'USD' ? 'United States' : 'Canada'
}

function countryFlag(currency?: string) {
  return currency === 'USD' ? '🇺🇸' : '🇨🇦'
}

export function BatchRowActionsMenu({ order }: { order: Order }) {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const items: MenuItem[] = [
    {
      key: 'expand',
      icon: <Plus size={14} strokeWidth={2} />,
      label: 'Expand details',
      hint: 'View full order row',
    },
    {
      key: 'country',
      icon: <span className="batch-row-menu__flag">{countryFlag(order.currency)}</span>,
      label: countryLabel(order.currency),
      hint: order.currency ?? 'CAD',
    },
    {
      key: 'rates',
      icon: <Tag size={14} strokeWidth={2} />,
      label: 'Rates',
      hint: 'Rate tags & overrides',
    },
    ...(order.hasPod
      ? [{
          key: 'pod',
          icon: <FileCheck size={14} strokeWidth={2} />,
          label: 'POD verified',
          hint: 'Proof of delivery on file',
        }]
      : []),
  ]

  useEffect(() => {
    if (!open) return
    const onPointer = (e: Event) => {
      const target = e.target as Node
      if (btnRef.current?.contains(target) || menuRef.current?.contains(target)) return
      setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const toggle = (e: MouseEvent) => {
    e.stopPropagation()
    if (open) {
      setOpen(false)
      return
    }
    const rect = btnRef.current?.getBoundingClientRect()
    if (!rect) return
    const menuW = 220
    let left = rect.left
    const top = rect.bottom + 6
    if (left + menuW > window.innerWidth - 12) {
      left = rect.right - menuW
    }
    setCoords({ top, left: Math.max(12, left) })
    setOpen(true)
  }

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className={cn('batch-row-menu__btn', open && 'is-open')}
        aria-label="Row actions"
        aria-expanded={open}
        onClick={toggle}
      >
        <MoreVertical size={16} strokeWidth={2} />
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            className="batch-row-menu"
            style={{ top: coords.top, left: coords.left }}
            role="menu"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="batch-row-menu__title">Order indicators</div>
            <ul className="batch-row-menu__list">
              {items.map((item) => (
                <li key={item.key}>
                  <button type="button" className="batch-row-menu__item" role="menuitem">
                    <span className="batch-row-menu__icon">{item.icon}</span>
                    <span className="batch-row-menu__text">
                      <span className="batch-row-menu__label">{item.label}</span>
                      {item.hint && <span className="batch-row-menu__hint">{item.hint}</span>}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>,
          document.body
        )}
    </>
  )
}
