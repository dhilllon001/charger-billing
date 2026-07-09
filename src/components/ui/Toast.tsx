import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'
import { useUiStore } from '@/stores/ui-store'

export function ToastContainer() {
  const toasts = useUiStore((s) => s.toasts)

  return (
    <div className="pointer-events-none fixed top-4 left-1/2 z-[100] flex -translate-x-1/2 flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-2 rounded-full bg-ink/94 px-4 py-2.5 text-[13px] text-white shadow-[var(--shadow-overlay)] backdrop-blur-xl"
          >
            {toast.type === 'success' && <Check size={16} strokeWidth={1.7} className="text-green" />}
            {toast.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
