import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { Button } from './Button'
import { cn } from '@/lib/cn'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

export function Modal({ open, onClose, title, children, footer, className }: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/20"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className={cn('fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-[22px] bg-card p-6 shadow-[var(--shadow-overlay)]', className)}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-[14.5px] font-bold text-ink">{title}</h2>
              <button onClick={onClose} className="rounded-full p-1 text-ink-3 hover:bg-black/[0.05]">
                <X size={18} strokeWidth={1.7} />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto">{children}</div>
            {footer && <div className="mt-6 flex justify-end gap-2">{footer}</div>}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export function ModalFooter({ onCancel, onSave, saveLabel = 'Save', saving }: { onCancel: () => void; onSave: () => void; saveLabel?: string; saving?: boolean }) {
  return (
    <>
      <Button variant="ghost" onClick={onCancel}>Cancel</Button>
      <Button onClick={onSave} disabled={saving}>{saveLabel}</Button>
    </>
  )
}
