import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, FileStack, Layers, Receipt, Mail, Fuel, Users, Shield,
  ChevronLeft, Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { useUiStore } from '@/stores/ui-store'
import { getStageCounts } from '@/data/mock-orders'
import { initials, avatarColor } from '@/lib/format'

const stageCounts = getStageCounts()

const workspaceNav = [
  { to: '/', icon: LayoutDashboard, label: 'Overview' },
  { to: '/batch-invoicing', icon: FileStack, label: 'Batch Invoicing', count: stageCounts.all },
  { to: '/consolidated', icon: Layers, label: 'Consolidated', count: 17 },
  { to: '/invoiced', icon: Receipt, label: 'Invoiced' },
  { to: '/email-delivery', icon: Mail, label: 'Email Delivery' },
]

const configNav = [
  { to: '/rates-fuel', icon: Fuel, label: 'Rates & Fuel', alert: 12 },
  { to: '/customers', icon: Users, label: 'Customers' },
  { to: '/permissions', icon: Shield, label: 'Permissions' },
]

export function Sidebar() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed)
  const toggle = useUiStore((s) => s.toggleSidebar)

  return (
    <>
      {!collapsed && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={toggle} />
      )}
      <aside
        className={cn(
          'sr-sidebar fixed inset-y-0 left-0 z-50 flex h-full w-[240px] shrink-0 flex-col transition-transform duration-300 ease-[var(--ease-apple)] lg:relative lg:z-auto',
          collapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'
        )}
      >
        <div className="border-b border-[var(--sr-nav-divider)] px-4 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--sr-action)] shadow-sm">
              <Sparkles size={17} strokeWidth={1.8} className="text-white" />
            </div>
            <div>
              <div className="sr-sidebar__brand-title">Charger Billing</div>
              <div className="sr-sidebar__brand-sub">AI Billing Workspace</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <NavGroup label="Workspace">
            {workspaceNav.map((item) => (
              <NavItem key={item.to} {...item} />
            ))}
          </NavGroup>
          <NavGroup label="Configuration" className="mt-6">
            {configNav.map((item) => (
              <NavItem key={item.to} {...item} />
            ))}
          </NavGroup>
        </nav>

        <div className="sr-sidebar__footer p-3">
          <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
              style={{ background: avatarColor('Harmandeep Singh') }}
            >
              {initials('Harmandeep Singh')}
            </div>
            <div className="min-w-0">
              <div className="sr-sidebar__user-name truncate">Harmandeep Singh</div>
              <div className="sr-sidebar__user-role truncate">Billing SuperAdmin</div>
            </div>
          </div>
          <button
            onClick={toggle}
            className="mt-2 flex w-full items-center justify-center rounded-md py-1.5 text-[var(--sr-nav-meta)] hover:bg-[var(--sr-nav-hover)] lg:hidden"
          >
            <ChevronLeft size={16} strokeWidth={1.7} />
          </button>
        </div>
      </aside>
    </>
  )
}

function NavGroup({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <div className="sr-sidebar__eyebrow">{label}</div>
      <div className="space-y-0.5">{children}</div>
    </div>
  )
}

function NavItem({ to, icon: Icon, label, count, alert }: {
  to: string
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
  label: string
  count?: number
  alert?: number
}) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) => cn('sr-sidebar__nav-link', isActive && 'is-active')}
    >
      <Icon size={17} strokeWidth={1.7} />
      <span className="flex-1">{label}</span>
      {count != null && <span className="sr-nav-count">{count.toLocaleString()}</span>}
      {alert != null && <span className="sr-nav-alert">{alert}</span>}
    </NavLink>
  )
}
