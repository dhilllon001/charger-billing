import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { SearchInput } from '@/components/ui/SearchInput'
import { Card } from '@/components/ui/Card'
import { billingUsers, getGroupCounts } from '@/data/mock-customers'
import { initials } from '@/lib/format'
import { cn } from '@/lib/cn'

const groupCounts = getGroupCounts()

const groups = [
  { id: 'SuperAdmin' as const, name: 'SuperAdmin', desc: 'Full system access including permissions and configuration', count: groupCounts.SuperAdmin },
  { id: 'Admin' as const, name: 'Admin', desc: 'Manage billing operations, customers, and user assignments', count: groupCounts.Admin },
  { id: 'Billing Users' as const, name: 'Billing Users', desc: 'Create and manage invoices for assigned customers', count: groupCounts['Billing Users'] },
  { id: 'Guest' as const, name: 'Guest', desc: 'Read-only access to assigned customer data', count: groupCounts.Guest },
]

export function PermissionsPage() {
  const [selectedGroup, setSelectedGroup] = useState<typeof groups[0]['id']>('SuperAdmin')
  const [search, setSearch] = useState('')

  const members = billingUsers.filter((u) => {
    if (u.group !== selectedGroup) return false
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[26px] font-bold tracking-[-0.022em]">Permissions</h1>
          <p className="mt-1 text-[13px] text-ink-3">Manage user groups and customer access assignments.</p>
        </div>
        <Button size="sm"><Plus size={14} strokeWidth={1.7} /> Invite user</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {groups.map((g) => (
          <Card
            key={g.id}
            onClick={() => setSelectedGroup(g.id)}
            className={cn('cursor-pointer p-4 transition-all', selectedGroup === g.id && 'ring-2 ring-accent')}
          >
            <div className="text-[14px] font-bold">{g.name}</div>
            <p className="mt-1 text-[12px] text-ink-3 line-clamp-2">{g.desc}</p>
            <div className="mt-3 text-[12px] font-semibold text-ink-2">{g.count} members</div>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search members…" className="w-72" />
      </div>

      <Card className="overflow-hidden">
        <div className="divide-y divide-line">
          {members.map((u) => (
            <div key={u.id} className="flex items-center gap-4 px-5 py-4 hover:bg-[#F7F9FC]">
              <div className="ai-gradient flex h-10 w-10 items-center justify-center rounded-full text-[12px] font-bold text-white">
                {initials(u.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[14px]">{u.name}</div>
                <div className="text-[12px] text-ink-3">{u.email}</div>
              </div>
              <span className="rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-semibold text-accent">
                {u.customerIds.length} customers
              </span>
              <Link to="/customers" className="text-[13px] font-medium text-accent hover:underline">
                Manage
              </Link>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  )
}
