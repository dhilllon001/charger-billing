import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Segment } from '@/components/ui/Segment'
import { Card } from '@/components/ui/Card'
import { Pill } from '@/components/ui/Pill'
import { SearchInput } from '@/components/ui/SearchInput'
import { fuelIndices, rateCards, laneLocations } from '@/data/mock-rates'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/cn'

const segments = [
  { id: 'fuel', label: 'Fuel indices' },
  { id: 'freight', label: 'Freight rates' },
  { id: 'surcharge', label: 'Fuel surcharge' },
  { id: 'equipment', label: 'Equipment map' },
  { id: 'missing', label: 'Missing rates', count: 12 },
  { id: 'imported', label: 'Imported lanes' },
  { id: 'expired', label: 'Expired rates' },
  { id: 'lane', label: 'Lane leg route' },
]

function Sparkline({ trend }: { trend: 'up' | 'down' | 'flat' }) {
  const color = trend === 'up' ? '#1FA85B' : trend === 'down' ? '#D93025' : '#86868B'
  return (
    <svg width="60" height="24" viewBox="0 0 60 24" className="opacity-80">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        points={trend === 'up' ? '0,20 15,15 30,12 45,8 60,4' : trend === 'down' ? '0,4 15,8 30,12 45,16 60,20' : '0,12 60,12'}
      />
    </svg>
  )
}

export function RatesFuelPage() {
  const [tab, setTab] = useState('fuel')
  const [selectedIndex, setSelectedIndex] = useState(fuelIndices[1].id)
  const [range, setRange] = useState('3M')
  const [expiryDays, setExpiryDays] = useState(10)
  const [customerSearch, setCustomerSearch] = useState('')
  const [showLaneLocations, setShowLaneLocations] = useState(false)

  const index = fuelIndices.find((f) => f.id === selectedIndex)!

  const filteredRates = rateCards.filter((r) =>
    !customerSearch || r.customer.toLowerCase().includes(customerSearch.toLowerCase())
  )

  const daysUntil = (date: string) => Math.ceil((new Date(date).getTime() - Date.now()) / 86400000)

  if (showLaneLocations) {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[26px] font-bold tracking-[-0.022em]">Lane Locations</h1>
            <p className="mt-1 text-[13px] text-ink-3">Manage master lane locations and aliases.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowLaneLocations(false)}>← Back</Button>
            <Button size="sm"><Plus size={14} strokeWidth={1.7} /> Add master lane location</Button>
          </div>
        </div>
        <Card className="overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#FCFCFD]">
              <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-ink-3">
                <th className="px-4 py-3">Source Item</th>
                <th className="px-4 py-3">Status Code</th>
                <th className="px-4 py-3">Created On</th>
                <th className="px-4 py-3">Created By</th>
                <th className="px-4 py-3">Modified On</th>
                <th className="px-4 py-3">Modified By</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {laneLocations.map((ll) => (
                <tr key={ll.id} className="border-t border-line hover:bg-[#F7F9FC]">
                  <td className="px-4 py-3 text-[12.5px] font-medium">{ll.sourceItem}</td>
                  <td className="px-4 py-3"><Pill variant={ll.statusCode === 'Active' ? 'green' : 'gray'}>{ll.statusCode}</Pill></td>
                  <td className="px-4 py-3 text-[12px]">{formatDate(ll.createdOn)}</td>
                  <td className="px-4 py-3 text-[12px]">{ll.createdBy}</td>
                  <td className="px-4 py-3 text-[12px]">{ll.modifiedOn ? formatDate(ll.modifiedOn) : '—'}</td>
                  <td className="px-4 py-3 text-[12px]">{ll.modifiedBy ?? '—'}</td>
                  <td className="px-4 py-3">
                    <button className="text-[12px] text-accent hover:underline">+ add alias</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[26px] font-bold tracking-[-0.022em]">Rates & Fuel</h1>
          <p className="mt-1 text-[13px] text-ink-3">Fuel indices, freight rates, and surcharge configuration.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm">Defaults</Button>
          <Button variant="ghost" size="sm" onClick={() => setShowLaneLocations(true)}>Lane locations</Button>
        </div>
      </div>

      <Segment items={segments} value={tab} onChange={setTab} />

      {tab === 'fuel' && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {fuelIndices.map((fi) => (
              <button
                key={fi.id}
                onClick={() => setSelectedIndex(fi.id)}
                className={cn(
                  'rounded-[16px] bg-card p-4 text-left shadow-[var(--shadow-rest)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-hover)]',
                  selectedIndex === fi.id && 'ring-2 ring-accent'
                )}
              >
                <div className="text-[12px] font-semibold text-ink-2">{fi.name}</div>
                {fi.value != null ? (
                  <>
                    <div className="mt-1 text-[18px] font-bold tabular-nums">
                      {fi.value}{fi.unit === '%' ? '%' : fi.unit === 'cent/liter' ? ' ¢/L' : fi.unit === '$/gallon' ? ' $/gal' : ''}
                    </div>
                    {fi.weeklyDeltaPct != null && (
                      <Pill variant={fi.trend === 'up' ? 'green' : fi.trend === 'down' ? 'red' : 'gray'} className="mt-1">
                        {fi.trend === 'up' ? '↑' : fi.trend === 'down' ? '↓' : '—'} {Math.abs(fi.weeklyDeltaPct)}%
                      </Pill>
                    )}
                    <Sparkline trend={fi.trend} />
                  </>
                ) : (
                  <div className="mt-2 text-[13px] text-ink-3">—</div>
                )}
              </button>
            ))}
          </div>

          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[14.5px] font-bold">{index.name} — Price History</h2>
              <div className="flex gap-1">
                {['3M', '6M', '1Y'].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRange(r)}
                    className={cn('rounded-lg px-2.5 py-1 text-[12px]', range === r ? 'bg-ink text-white' : 'text-ink-2 hover:bg-black/[0.04]')}
                  >
                    {r === '3M' ? 'Last 3 Months' : r === '6M' ? '6M' : '1Y'}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4 h-32 flex items-end gap-1">
              {(index.history.length ? index.history : [{ price: 0 }]).map((_, i) => (
                <div key={i} className="flex-1 rounded-t bg-accent/20" style={{ height: `${30 + (i % 5) * 15}%` }} />
              ))}
            </div>
            <table className="w-full">
              <thead>
                <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-ink-3">
                  <th className="pb-2">Action</th>
                  <th className="pb-2">Price</th>
                  <th className="pb-2">Week Beginning</th>
                  <th className="pb-2">Week Ending</th>
                  <th className="pb-2">Updated By</th>
                  <th className="pb-2">Updated On</th>
                </tr>
              </thead>
              <tbody>
                {index.history.map((h, i) => (
                  <tr key={i} className="border-t border-line">
                    <td className="py-2.5">
                      <div className="flex gap-1">
                        <button className="rounded p-1 hover:bg-black/[0.05]"><Pencil size={14} strokeWidth={1.7} /></button>
                        <button className="rounded p-1 hover:bg-black/[0.05]"><Trash2 size={14} strokeWidth={1.7} /></button>
                      </div>
                    </td>
                    <td className="py-2.5 tabular-nums font-semibold">{h.price.toFixed(3)}</td>
                    <td className="py-2.5 text-[12px]">{formatDate(h.weekBeginning)}</td>
                    <td className="py-2.5 text-[12px]">{formatDate(h.weekEnding)}</td>
                    <td className="py-2.5 text-[12px]">{h.updatedBy}</td>
                    <td className="py-2.5 text-[12px]">{formatDate(h.updatedOn)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Button variant="ghost" size="sm" className="mt-4"><Plus size={14} strokeWidth={1.7} /> Add weekly price</Button>
          </Card>
        </>
      )}

      {tab === 'expired' && (
        <>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 text-[13px]">
              <span className="text-ink-2">Upcoming expiry</span>
              <select value={expiryDays} onChange={(e) => setExpiryDays(Number(e.target.value))} className="rounded-lg border border-line px-2 py-1 text-[12px]">
                {[7, 10, 14, 30].map((d) => <option key={d} value={d}>{d} days</option>)}
              </select>
            </div>
            <SearchInput value={customerSearch} onChange={setCustomerSearch} placeholder="Search customer…" className="w-64" />
          </div>
          <div className="space-y-2">
            {filteredRates.map((rc) => {
              const days = daysUntil(rc.expiryDate)
              return (
                <Card key={rc.id} className="flex items-center gap-4 p-4">
                  <Pill variant={days <= 7 ? 'red' : days <= 10 ? 'orange' : 'gray'}>{days}d</Pill>
                  <div className="flex-1">
                    <div className="font-semibold text-[13px]">
                      {rc.customer} · {rc.origin} → {rc.destination}
                    </div>
                    <div className="text-[11px] text-ink-3">
                      {rc.equipment} · effective {formatDate(rc.effectiveDate)} → expires {formatDate(rc.expiryDate)} · Lane {rc.laneTypeCode}
                    </div>
                  </div>
                  <Button size="sm" variant="ghost">Renew rate</Button>
                </Card>
              )
            })}
          </div>
        </>
      )}

      {!['fuel', 'expired'].includes(tab) && (
        <Card className="flex flex-col items-center justify-center py-20">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-black/[0.04] text-ink-3">📋</div>
          <p className="text-[15px] font-semibold">{segments.find((s) => s.id === tab)?.label}</p>
          <p className="mt-1 text-[13px] text-ink-3">This section is ready for data integration.</p>
        </Card>
      )}
    </motion.div>
  )
}
