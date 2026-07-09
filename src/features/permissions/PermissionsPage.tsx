import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/layout/PageHeader'
import { billingUsers, getGroupCounts } from '@/data/mock-customers'
import { userCustomerAssignments } from '@/data/mock-legacy-customers'
import { avatarColor, initials } from '@/lib/format'
import { cn } from '@/lib/cn'

const groupCounts = getGroupCounts()

const groups = [
  { id: 'SuperAdmin' as const, name: 'SuperAdmin', desc: 'Full system access including permissions and configuration', count: groupCounts.SuperAdmin },
  { id: 'Admin' as const, name: 'Admin', desc: 'Manage billing operations, customers, and user assignments', count: groupCounts.Admin },
  { id: 'Billing Users' as const, name: 'Billing Users', desc: 'Create and manage invoices for assigned customers', count: groupCounts['Billing Users'] },
  { id: 'Guest' as const, name: 'Guest', desc: 'Read-only access to assigned customer data', count: groupCounts.Guest },
]

const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

export function PermissionsPage() {
  const [view, setView] = useState<'groups' | 'user-customers'>('groups')
  const [selectedGroup, setSelectedGroup] = useState<typeof groups[0]['id']>('SuperAdmin')
  const [selectedUserId, setSelectedUserId] = useState('u-001')
  const [search, setSearch] = useState('')
  const [customerSearch, setCustomerSearch] = useState('')

  const members = billingUsers.filter((u) => {
    if (view === 'groups' && u.group !== selectedGroup) return false
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const selectedUser = billingUsers.find((u) => u.id === selectedUserId)!
  const assignedCustomers = userCustomerAssignments[selectedUserId] ?? []

  const groupedCustomers = useMemo(() => {
    const map = new Map<string, string[]>()
    for (const name of assignedCustomers) {
      const key = name[0]?.toUpperCase() ?? '#'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(name)
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b))
  }, [assignedCustomers])

  if (view === 'user-customers') {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <PageHeader
          title="User Customer Permissions"
          subtitle="Assign customers to billing users — grouped A–Z."
          actions={<><Button variant="ghost" size="sm" onClick={() => setView('groups')}>← Permissions</Button><Button size="sm"><Plus size={14} strokeWidth={1.7} /> Add Customer</Button></>}
        />
        <div className="flex flex-col gap-4 xl:flex-row xl:min-h-[calc(100vh-220px)]">
          <Card className="w-full shrink-0 overflow-hidden xl:w-[280px]">
            <div className="border-b border-line p-3">
              <div className="relative">
                <Search size={16} strokeWidth={1.7} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users…" className="h-9 w-full rounded-[10px] border border-line pl-9 pr-3 text-[13px] outline-none" />
              </div>
            </div>
            {billingUsers.map((u) => (
              <button key={u.id} onClick={() => setSelectedUserId(u.id)} className={cn('flex w-full items-center gap-3 border-b border-line px-4 py-3 text-left', selectedUserId === u.id ? 'bg-accent-soft' : 'hover:bg-black/[0.02]')}>
                <div className="flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ background: avatarColor(u.name) }}>{initials(u.name)}</div>
                <div><div className="text-[13px] font-semibold">{u.name}</div><div className="text-[11px] text-ink-3">{u.customerIds.length || 67} Customers</div></div>
              </button>
            ))}
          </Card>
          <Card className="min-w-0 flex-1 p-4 sm:p-5">
            <h2 className="text-[18px] font-bold">{selectedUser.name}</h2>
            <p className="text-[12px] text-ink-3">{assignedCustomers.length || 67} Customers</p>
            <input value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)} placeholder="Search customers…" className="mt-4 h-9 w-full rounded-[10px] border border-line px-3 text-[13px] outline-none" />
            <div className="mt-3 flex gap-1 overflow-x-auto">{letters.map((l) => <button key={l} className="shrink-0 rounded px-1.5 py-0.5 text-[11px] font-semibold text-ink-3 hover:bg-black/[0.05]">{l}</button>)}</div>
            <div className="mt-4 space-y-4">
              {groupedCustomers.map(([letter, names]) => (
                <div key={letter} className="flex gap-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line text-[12px] font-bold">{letter}</span>
                  <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {names.filter((n) => !customerSearch || n.toLowerCase().includes(customerSearch.toLowerCase())).map((n) => (
                      <div key={n} className="rounded-xl border border-line bg-white px-3 py-2 text-[12px] font-medium">{n}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 sm:space-y-5">
      <PageHeader
        title="Permissions"
        subtitle="Billing SuperAdmin, Admin, Billing Users, and Guest groups."
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={() => setView('user-customers')}>User ↔ Customers</Button>
            <Button size="sm"><Plus size={14} strokeWidth={1.7} /> Invite user</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {groups.map((g) => (
          <Card key={g.id} onClick={() => setSelectedGroup(g.id)} className={cn('cursor-pointer p-4', selectedGroup === g.id && 'ring-2 ring-accent')}>
            <div className="text-[14px] font-bold">{g.name}</div>
            <p className="mt-1 line-clamp-2 text-[12px] text-ink-3">{g.desc}</p>
            <div className="mt-3 text-[12px] font-semibold text-ink-2">{g.count} members</div>
          </Card>
        ))}
      </div>

      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search members…" className="h-9 w-full max-w-xs rounded-[10px] border border-line px-3 text-[13px] outline-none focus:ring-2 focus:ring-accent-soft" />

      <Card className="overflow-hidden">
        <div className="divide-y divide-line">
          {members.map((u) => (
            <div key={u.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:gap-4 sm:px-5 hover:bg-[#F7F9FC]">
              <div className="ai-gradient flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white">{initials(u.name)}</div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-[14px]">{u.name}</div>
                <div className="text-[12px] text-ink-3">{u.email}</div>
              </div>
              <span className="w-fit rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-semibold text-accent">{u.customerIds.length} customers</span>
              <button onClick={() => { setSelectedUserId(u.id); setView('user-customers') }} className="text-[13px] font-medium text-accent hover:underline">Manage</button>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  )
}
