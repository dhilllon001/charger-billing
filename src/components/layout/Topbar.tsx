import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { Bell, Settings, Sparkles } from 'lucide-react'
import { useUiStore } from '@/stores/ui-store'
import { cn } from '@/lib/cn'

const pageTitles: Record<string, string> = {
  '/': 'Overview',
  '/batch-invoicing': 'Batch Invoicing',
  '/consolidated': 'Consolidated',
  '/invoiced': 'Invoiced',
  '/email-delivery': 'Email Delivery',
  '/rates-fuel': 'Rates & Fuel',
  '/customers': 'Customers',
  '/permissions': 'Permissions',
}

export function Topbar() {
  const location = useLocation()
  const setCopilotOpen = useUiStore((s) => s.setCopilotOpen)
  const setAskAiFocused = useUiStore((s) => s.setAskAiFocused)
  const askAiFocused = useUiStore((s) => s.askAiFocused)
  const inputRef = useRef<HTMLInputElement>(null)
  const page = pageTitles[location.pathname] ?? 'Billing'

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCopilotOpen(true)
        setAskAiFocused(true)
        setTimeout(() => inputRef.current?.focus(), 100)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [setCopilotOpen, setAskAiFocused])

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-line frosted px-7">
      <div className="shrink-0 text-[13px] text-ink-3">
        Billing <span className="text-ink-3">/</span>{' '}
        <span className="font-medium text-ink">{page}</span>
      </div>

      <div className="mx-auto w-full max-w-md">
        <button
          onClick={() => { setCopilotOpen(true); setAskAiFocused(true) }}
          className={cn(
            'flex w-full items-center gap-2 rounded-xl border border-line bg-white/80 px-4 py-2 text-left text-[13px] text-ink-3 transition-all hover:border-line-strong hover:shadow-[var(--shadow-rest)]',
            askAiFocused && 'ring-2 ring-accent-soft'
          )}
        >
          <Sparkles size={16} strokeWidth={1.7} className="ai-gradient-text" />
          <span>Ask AI — "show unbilled Labatt orders over 30 days"</span>
          <kbd className="ml-auto rounded-md bg-black/[0.05] px-1.5 py-0.5 text-[10px] font-medium">⌘K</kbd>
        </button>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <button className="rounded-full p-2 text-ink-2 hover:bg-black/[0.05]">
          <Bell size={18} strokeWidth={1.7} />
        </button>
        <button className="rounded-full p-2 text-ink-2 hover:bg-black/[0.05]">
          <Settings size={18} strokeWidth={1.7} />
        </button>
      </div>
    </header>
  )
}
