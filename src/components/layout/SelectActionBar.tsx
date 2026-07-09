import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/format'
import { useUiStore } from '@/stores/ui-store'

interface SelectActionBarProps {
  count: number
  total: number
  onClear: () => void
  onPreview?: () => void
  onGenerate: () => void
  generateLabel?: string
}

export function SelectActionBar({ count, total, onClear, onPreview, onGenerate, generateLabel = 'Generate invoices' }: SelectActionBarProps) {
  const addToast = useUiStore((s) => s.addToast)

  if (count === 0) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-full bg-ink/94 px-5 py-3 text-white shadow-[var(--shadow-overlay)] backdrop-blur-xl"
      >
        <span className="text-[13px] font-medium tabular-nums">
          {count} selected · {formatCurrency(total)}
        </span>
        <button onClick={onClear} className="flex items-center gap-1 text-[12px] text-white/70 hover:text-white">
          <X size={14} strokeWidth={1.7} /> Clear
        </button>
        {onPreview && (
          <Button variant="ghost" size="sm" className="!border-white/20 !text-white hover:!bg-white/10" onClick={onPreview}>
            Preview draft
          </Button>
        )}
        <Button
          size="sm"
          onClick={() => {
            onGenerate()
            addToast(`Generated ${count} invoices successfully`)
          }}
        >
          {generateLabel}
        </Button>
      </motion.div>
    </AnimatePresence>
  )
}
