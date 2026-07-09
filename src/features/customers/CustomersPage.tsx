import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Segment } from '@/components/ui/Segment'
import { SearchInput } from '@/components/ui/SearchInput'
import { FilterChip } from '@/components/ui/FilterChip'
import { Card } from '@/components/ui/Card'
import { Drawer } from '@/components/ui/Drawer'
import { PageHeader } from '@/components/layout/PageHeader'
import { legacyCustomers, customerSegmentCounts } from '@/data/mock-legacy-customers'
import { billingUsers } from '@/data/mock-customers'
import { avatarColor, initials } from '@/lib/format'
import { cn } from '@/lib/cn'
import type { Customer } from '@/data/models'

const segments = [
  { id: 'active', label: 'Assigned', count: customerSegmentCounts.assigned },
  { id: 'new', label: 'New', count: customerSegmentCounts.new },
  { id: 'disabled', label: 'Disabled', count: customerSegmentCounts.disabled },
]

const letters = '#ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

export function CustomersPage() {
  const [segment, setSegment] = useState('active')
  const [search, setSearch] = useState('')
  const [letter, setLetter] = useState<string | null>(null)
  const [selected, setSelected] = useState<Customer | null>(null)

  const filtered = useMemo(() => {
    return legacyCustomers.filter((c) => {
      if (segment === 'active' && c.status !== 'active') return false
      if (segment === 'new' && c.status !== 'new') return false
      if (segment === 'disabled' && c.status !== 'disabled') return false
      if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false
      if (letter && letter !== '#') {
        if (c.name[0]?.toUpperCase() !== letter) return false
      }
      return true
    })
  }, [segment, search, letter])

  const grouped = useMemo(() => {
    const map = new Map<string, Customer[]>()
    for (const c of filtered) {
      const key = c.name[0]?.toUpperCase() ?? '#'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(c)
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b))
  }, [filtered])

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 sm:space-y-5">
      <PageHeader title="Customers" subtitle="Click a customer card to view assigned users and permissions." actions={<Button size="sm"><Plus size={14} strokeWidth={1.7} /> Add customer</Button>} />

      <div className="overflow-x-auto"><Segment items={segments} value={segment} onChange={setSegment} className="min-w-max" /></div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <SearchInput value={search} onChange={setSearch} placeholder="Search customers…" className="w-full sm:w-80" />
        <FilterChip label="Active" active />
        <FilterChip label="Region" />
      </div>

      <div className="sticky top-0 z-10 -mx-1 flex gap-0.5 overflow-x-auto border-b border-line bg-bg py-2 text-[11px] font-semibold text-ink-3">
        {letters.map((l) => (
          <button key={l} onClick={() => setLetter(letter === l ? null : l)} className={cn('shrink-0 rounded px-1.5 py-0.5 hover:bg-black/[0.05] hover:text-ink', letter === l && 'bg-ink text-white')}>{l}</button>
        ))}
      </div>

      {grouped.map(([group, items]) => (
        <div key={group}>
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black/[0.06] text-[12px] font-bold">{group}</span>
            <span className="text-[12px] text-ink-3">{items.length} customers</span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8">
            {items.map((c) => {
              const userCount = c.assignedUserIds.length || (c.name.length % 5) + 1
              return (
                <Card key={c.id} hover onClick={() => setSelected(c)} className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white" style={{ background: avatarColor(c.name) }}>{initials(c.name)}</div>
                    <div className="min-w-0 flex-1">
                      <div className="line-clamp-2 text-[12px] font-semibold leading-tight">{c.name}</div>
                      <div className="mt-0.5 text-[11px] text-ink-3">{userCount} users · {c.region}</div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      ))}

      <Drawer open={!!selected} onClose={() => setSelected(null)} title={selected?.name ?? ''} width={400}>
        {selected && (
          <div className="space-y-4 p-5">
            <p className="text-[12px] text-ink-3">Assigned users for this customer</p>
            {billingUsers.filter((u) => selected.assignedUserIds.includes(u.id)).map((u) => (
              <div key={u.id} className="flex items-center gap-3 rounded-xl bg-black/[0.02] p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ background: avatarColor(u.name) }}>{initials(u.name)}</div>
                <div><div className="text-[13px] font-medium">{u.name}</div><div className="text-[11px] text-ink-3">{u.email}</div></div>
              </div>
            ))}
            <Button variant="ghost" size="sm" className="w-full"><Plus size={14} strokeWidth={1.7} /> Add user assignment</Button>
          </div>
        )}
      </Drawer>
    </motion.div>
  )
}
