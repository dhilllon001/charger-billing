import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'

interface DrawerProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  width?: number
  className?: string
}

export function Drawer({ open, onClose, title, children, width = 400, className }: DrawerProps) {
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
          <motion.aside
            initial={{ x: width }}
            animate={{ x: 0 }}
            exit={{ x: width }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{ width }}
            className={cn('fixed right-0 top-0 z-50 flex h-full flex-col frosted-panel border-l border-line shadow-[var(--shadow-overlay)]', className)}
          >
            {title && (
              <div className="flex items-center justify-between border-b border-line px-5 py-4">
                <h2 className="text-[14.5px] font-bold">{title}</h2>
                <button onClick={onClose} className="rounded-full p-1 text-ink-3 hover:bg-black/[0.05]">
                  <X size={18} strokeWidth={1.7} />
                </button>
              </div>
            )}
            <div className="flex-1 overflow-y-auto">{children}</div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
