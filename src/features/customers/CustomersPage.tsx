import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Segment } from '@/components/ui/Segment'
import { SearchInput } from '@/components/ui/SearchInput'
import { FilterChip } from '@/components/ui/FilterChip'
import { Card } from '@/components/ui/Card'
import { Drawer } from '@/components/ui/Drawer'
import { customers, billingUsers, getCustomerSegmentCounts } from '@/data/mock-customers'
import { avatarColor, initials } from '@/lib/format'
import type { Customer } from '@/data/models'

const counts = getCustomerSegmentCounts()
const segments = [
  { id: 'active', label: 'Assigned', count: counts.assigned },
  { id: 'new', label: 'New', count: counts.new },
  { id: 'disabled', label: 'Disabled', count: counts.disabled },
]

export function CustomersPage() {
  const [segment, setSegment] = useState('active')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Customer | null>(null)
  const [userSearch, setUserSearch] = useState('')

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      if (segment === 'active' && c.status !== 'active') return false
      if (segment === 'new' && c.status !== 'new') return false
      if (segment === 'disabled' && c.status !== 'disabled') return false
      if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [segment, search])

  const assignedUsers = selected
    ? billingUsers.filter((u) => selected.assignedUserIds.includes(u.id))
    : []

  const userCustomers = (userId: string) =>
    customers.filter((c) => c.assignedUserIds.includes(userId))

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[26px] font-bold tracking-[-0.022em]">Customers</h1>
          <p className="mt-1 text-[13px] text-ink-3">Manage billing customers and user assignments.</p>
        </div>
        <Button size="sm"><Plus size={14} strokeWidth={1.7} /> Add customer</Button>
      </div>

      <Segment items={segments} value={segment} onChange={setSegment} />

      <div className="flex flex-wrap gap-2">
        <SearchInput value={search} onChange={setSearch} placeholder="Search customers…" className="w-80" />
        <FilterChip label="Active status" active />
        <FilterChip label="Region" />
      </div>

      <div className="sticky top-0 z-10 flex gap-1 overflow-x-auto border-b border-line bg-bg py-2 text-[11px] font-semibold text-ink-3">
        {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((l) => (
          <button key={l} className="rounded px-1.5 py-0.5 hover:bg-black/[0.05] hover:text-ink">{l}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((c) => {
          const userCount = c.assignedUserIds.length || Math.floor(Math.random() * 5) + 1
          return (
            <Card key={c.id} hover onClick={() => setSelected(c)} className="p-5">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white"
                  style={{ background: avatarColor(c.name) }}
                >
                  {initials(c.name)}
                </div>
                <div className="min-w-0">
                  <div className="truncate font-semibold text-[14px]">{c.name}</div>
                  <div className="text-[12px] text-ink-3">{userCount} users · {c.region}</div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <Drawer open={!!selected} onClose={() => setSelected(null)} title={selected?.name ?? ''} width={420}>
        {selected && (
          <div className="p-5 space-y-6">
            <div>
              <h3 className="text-[12px] font-semibold uppercase tracking-[0.05em] text-ink-3">Assigned users</h3>
              <div className="mt-3 space-y-2">
                {assignedUsers.length > 0 ? assignedUsers.map((u) => (
                  <div key={u.id} className="flex items-center gap-3 rounded-xl bg-black/[0.02] p-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ background: avatarColor(u.name) }}>
                      {initials(u.name)}
                    </div>
                    <div>
                      <div className="text-[13px] font-medium">{u.name}</div>
                      <div className="text-[11px] text-ink-3">{u.email}</div>
                    </div>
                  </div>
                )) : (
                  <p className="text-[13px] text-ink-3">No users assigned yet.</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-[12px] font-semibold uppercase tracking-[0.05em] text-ink-3">User ↔ Customer permissions</h3>
              <SearchInput value={userSearch} onChange={setUserSearch} placeholder="Search users…" className="mt-2 w-full" />
              <div className="mt-3 max-h-64 space-y-2 overflow-y-auto">
                {billingUsers.filter((u) => !userSearch || u.name.toLowerCase().includes(userSearch.toLowerCase())).map((u) => (
                  <div key={u.id} className="rounded-xl border border-line p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[13px]">{u.name}</span>
                      <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-semibold text-accent">{u.customerIds.length} customers</span>
                    </div>
                    <div className="mt-2 text-[11px] text-ink-3">
                      {userCustomers(u.id).slice(0, 3).map((c) => c.name).join(' · ')}
                      {userCustomers(u.id).length > 3 && ` +${userCustomers(u.id).length - 3}`}
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="ghost" size="sm" className="mt-3"><Plus size={14} strokeWidth={1.7} /> Add customer</Button>
            </div>
          </div>
        )}
      </Drawer>
    </motion.div>
  )
}
