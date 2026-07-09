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
    <aside
      className={cn(
        'flex h-full shrink-0 flex-col border-r border-line bg-[#FBFBFD] transition-all duration-300 ease-[var(--ease-apple)]',
        collapsed ? 'w-[68px]' : 'w-[236px]'
      )}
    >
      <div className={cn('border-b border-line px-4 py-5', collapsed && 'px-2')}>
        {!collapsed ? (
          <>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl ai-gradient">
                <Sparkles size={16} strokeWidth={1.7} className="text-white" />
              </div>
              <div>
                <div className="text-[13px] font-bold text-ink">Charger Billing</div>
                <div className="text-[11px] text-ink-3">AI Billing Workspace</div>
              </div>
            </div>
          </>
        ) : (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-xl ai-gradient">
            <Sparkles size={16} strokeWidth={1.7} className="text-white" />
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <NavGroup label="Workspace" collapsed={collapsed}>
          {workspaceNav.map((item) => (
            <NavItem key={item.to} {...item} collapsed={collapsed} />
          ))}
        </NavGroup>
        <NavGroup label="Configuration" collapsed={collapsed} className="mt-6">
          {configNav.map((item) => (
            <NavItem key={item.to} {...item} collapsed={collapsed} />
          ))}
        </NavGroup>
      </nav>

      <div className="border-t border-line p-3">
        <div className={cn('flex items-center gap-2.5 rounded-xl px-2 py-2', collapsed && 'justify-center')}>
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
            style={{ background: avatarColor('Harmandeep Singh') }}
          >
            {initials('Harmandeep Singh')}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="truncate text-[12px] font-semibold">Harmandeep Singh</div>
              <div className="truncate text-[11px] text-ink-3">Billing SuperAdmin</div>
            </div>
          )}
        </div>
        <button
          onClick={toggle}
          className="mt-2 flex w-full items-center justify-center rounded-lg py-1.5 text-ink-3 hover:bg-black/[0.04] lg:hidden"
        >
          <ChevronLeft size={16} strokeWidth={1.7} className={cn(collapsed && 'rotate-180')} />
        </button>
      </div>
    </aside>
  )
}

function NavGroup({ label, children, collapsed, className }: { label: string; children: React.ReactNode; collapsed: boolean; className?: string }) {
  return (
    <div className={className}>
      {!collapsed && <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-3">{label}</div>}
      <div className="space-y-0.5">{children}</div>
    </div>
  )
}

function NavItem({ to, icon: Icon, label, count, alert, collapsed }: {
  to: string; icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
  label: string; count?: number; alert?: number; collapsed?: boolean
}) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] font-medium transition-all duration-150',
          isActive ? 'bg-white text-ink shadow-[var(--shadow-rest)]' : 'text-ink-2 hover:bg-white/60 hover:text-ink',
          collapsed && 'justify-center px-2'
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={18} strokeWidth={1.7} className={isActive ? 'text-accent' : ''} />
          {!collapsed && (
            <>
              <span className="flex-1">{label}</span>
              {count != null && <span className="text-[11px] tabular-nums text-ink-3">{count}</span>}
              {alert != null && <span className="rounded-full bg-orange-soft px-1.5 text-[10px] font-semibold text-orange">{alert}</span>}
            </>
          )}
        </>
      )}
    </NavLink>
  )
}
