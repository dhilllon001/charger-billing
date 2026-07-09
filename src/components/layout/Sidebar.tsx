import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, FileStack, Layers, Receipt, Mail, Fuel, Users, Shield,
  ChevronLeft, ChevronRight, Sparkles,
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
    <aside
      className={cn(
        'sr-sidebar flex h-screen shrink-0 flex-col transition-all duration-300 ease-[var(--ease-apple)]',
        collapsed ? 'w-[68px]' : 'w-[240px]'
      )}
    >
      <div className={cn('border-b border-[var(--sr-nav-divider)] px-3 py-4', !collapsed && 'px-4 py-5')}>
        <div className={cn('flex items-center', collapsed ? 'justify-center' : 'gap-2.5')}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--sr-action)] shadow-sm">
            <Sparkles size={17} strokeWidth={1.8} className="text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="sr-sidebar__brand-title">Charger Billing</div>
              <div className="sr-sidebar__brand-sub">AI Billing Workspace</div>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3">
        <NavGroup label="Workspace" collapsed={collapsed}>
          {workspaceNav.map((item) => (
            <NavItem key={item.to} {...item} collapsed={collapsed} />
          ))}
        </NavGroup>
        <NavGroup label="Configuration" collapsed={collapsed} className="mt-5">
          {configNav.map((item) => (
            <NavItem key={item.to} {...item} collapsed={collapsed} />
          ))}
        </NavGroup>
      </nav>

      <div className="sr-sidebar__footer border-t border-[var(--sr-nav-divider)] p-2">
        <div className={cn('flex items-center rounded-lg px-1 py-1.5', collapsed ? 'justify-center' : 'gap-2.5 px-2')}>
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
            style={{ background: avatarColor('Harmandeep Singh') }}
            title={collapsed ? 'Harmandeep Singh' : undefined}
          >
            {initials('Harmandeep Singh')}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="sr-sidebar__user-name truncate">Harmandeep Singh</div>
              <div className="sr-sidebar__user-role truncate">Billing SuperAdmin</div>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={toggle}
          className="sr-sidebar__toggle mt-1 flex w-full items-center justify-center rounded-lg py-2 text-[var(--sr-nav-meta)] transition-colors hover:bg-[var(--sr-nav-hover)] hover:text-[var(--sr-nav-text)]"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? <ChevronRight size={16} strokeWidth={1.7} /> : <ChevronLeft size={16} strokeWidth={1.7} />}
        </button>
      </div>
    </aside>
  )
}

function NavGroup({
  label,
  children,
  collapsed,
  className,
}: {
  label: string
  children: React.ReactNode
  collapsed: boolean
  className?: string
}) {
  return (
    <div className={className}>
      {!collapsed && <div className="sr-sidebar__eyebrow">{label}</div>}
      <div className="space-y-0.5">{children}</div>
    </div>
  )
}

function NavItem({
  to,
  icon: Icon,
  label,
  count,
  alert,
  collapsed,
}: {
  to: string
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
  label: string
  count?: number
  alert?: number
  collapsed?: boolean
}) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        cn(
          'sr-sidebar__nav-link',
          collapsed && 'sr-sidebar__nav-link--collapsed justify-center !px-0',
          isActive && 'is-active'
        )
      }
    >
      <Icon size={18} strokeWidth={1.7} className="shrink-0" />
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{label}</span>
          {count != null && <span className="sr-nav-count">{count.toLocaleString()}</span>}
          {alert != null && <span className="sr-nav-alert">{alert}</span>}
        </>
      )}
    </NavLink>
  )
}
