import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { Bell, Settings, Sparkles, Menu } from 'lucide-react'
import { useUiStore } from '@/stores/ui-store'

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
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)
  const inputRef = useRef<HTMLInputElement>(null)
  const page = location.pathname.startsWith('/orders/')
    ? 'Order Detail'
    : pageTitles[location.pathname] ?? 'Billing'

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
    <header className="sr-topbar sticky top-0 z-40 flex flex-wrap items-center gap-3 px-4 sm:px-6">
      <button onClick={toggleSidebar} className="sr-topbar__icon-btn" aria-label="Toggle menu">
        <Menu size={18} strokeWidth={1.7} />
      </button>

      <div className="sr-topbar__crumb shrink-0">
        Billing <span>/</span> <strong>{page}</strong>
      </div>

      <div className="order-3 w-full sm:order-none sm:mx-auto sm:w-auto sm:flex-1 sm:flex sm:justify-center">
        <div className="charger-ai-bar-wrap">
          <button
            type="button"
            onClick={() => {
              setCopilotOpen(true)
              setAskAiFocused(true)
            }}
            className="charger-ai-bar"
          >
            <Sparkles size={15} strokeWidth={1.7} className="charger-ai-bar__icon" />
            <span className="charger-ai-bar__brand">Charger AI</span>
            <span className="charger-ai-bar__hint hidden sm:inline">
              Validate rates, find orders, draft invoices…
            </span>
            <kbd className="charger-ai-bar__kbd ml-auto hidden sm:inline">⌘K</kbd>
          </button>
        </div>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-0.5">
        <button type="button" className="sr-topbar__icon-btn" aria-label="Notifications">
          <Bell size={18} strokeWidth={1.7} />
        </button>
        <button type="button" className="sr-topbar__icon-btn" aria-label="Settings">
          <Settings size={18} strokeWidth={1.7} />
        </button>
      </div>
    </header>
  )
}
