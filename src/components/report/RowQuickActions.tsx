import { useState, useRef, useEffect } from 'react'
import { MoreHorizontal, ExternalLink, FileText, Sparkles } from 'lucide-react'
import { cn } from '@/lib/cn'

type RowQuickActionsProps = {
  onOpen: () => void
  onAudit?: () => void
  onInvoice?: () => void
}

export function RowQuickActions({ onOpen, onAudit, onInvoice }: RowQuickActionsProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  return (
    <div ref={ref} className="sr-row-actions" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        className={cn('sr-row-actions__btn', open && 'is-open')}
        onClick={() => setOpen((v) => !v)}
        aria-label="Quick actions"
      >
        <MoreHorizontal size={15} strokeWidth={2} />
      </button>
      {open && (
        <div className="sr-row-actions__menu">
          <button type="button" onClick={() => { onOpen(); setOpen(false) }}>
            <ExternalLink size={13} strokeWidth={1.7} /> Open order
          </button>
          {onAudit && (
            <button type="button" onClick={() => { onAudit(); setOpen(false) }}>
              <Sparkles size={13} strokeWidth={1.7} /> Run audit
            </button>
          )}
          {onInvoice && (
            <button type="button" onClick={() => { onInvoice(); setOpen(false) }}>
              <FileText size={13} strokeWidth={1.7} /> Draft invoice
            </button>
          )}
        </div>
      )}
    </div>
  )
}
