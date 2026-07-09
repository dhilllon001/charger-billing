import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Segment } from '@/components/ui/Segment'
import { Card } from '@/components/ui/Card'
import { Pill } from '@/components/ui/Pill'
import { SearchInput } from '@/components/ui/SearchInput'
import { Modal, ModalFooter } from '@/components/ui/Modal'
import { PageHeader } from '@/components/layout/PageHeader'
import { Switch } from '@/components/ui/Switch'
import { fuelIndices, rateCards, laneLocations } from '@/data/mock-rates'
import { customerConfigs, freightRates } from '@/data/mock-freight'
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
      <polyline fill="none" stroke={color} strokeWidth="1.5" points={trend === 'up' ? '0,20 60,4' : trend === 'down' ? '0,4 60,20' : '0,12 60,12'} />
    </svg>
  )
}

export function RatesFuelPage() {
  const [tab, setTab] = useState('fuel')
  const [selectedIndex, setSelectedIndex] = useState(fuelIndices[1].id)
  const [selectedCustomer, setSelectedCustomer] = useState(customerConfigs[0].id)
  const [range, setRange] = useState('3M')
  const [expiryDays, setExpiryDays] = useState(10)
  const [customerSearch, setCustomerSearch] = useState('')
  const [laneModal, setLaneModal] = useState(false)
  const [showLaneLocations, setShowLaneLocations] = useState(false)

  const index = fuelIndices.find((f) => f.id === selectedIndex)!
  const customer = customerConfigs.find((c) => c.id === selectedCustomer)!
  const rates = freightRates.filter((r) => r.customerId === selectedCustomer)

  const filteredRates = rateCards.filter((r) =>
    !customerSearch || r.customer.toLowerCase().includes(customerSearch.toLowerCase())
  )

  const daysUntil = (date: string) => Math.ceil((new Date(date).getTime() - Date.now()) / 86400000)

  if (showLaneLocations) {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
        <PageHeader title="Lane Locations" subtitle="Duplicate lane location management — master locations and aliases." actions={
          <><Button variant="ghost" size="sm" onClick={() => setShowLaneLocations(false)}>← Back</Button>
          <Button size="sm"><Plus size={14} strokeWidth={1.7} /> Add master lane location</Button></>
        } />
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-[#FCFCFD]">
              <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-ink-3">
                <th className="px-4 py-3">Source Item</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Created On</th><th className="px-4 py-3">Created By</th><th className="px-4 py-3">Modified On</th><th className="px-4 py-3">Modified By</th><th className="px-4 py-3"></th>
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
                  <td className="px-4 py-3"><button className="text-[12px] text-accent">+ add alias</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 sm:space-y-5">
      <PageHeader
        title="Rates & Fuel"
        subtitle="Customer configuration — fuel indices, freight rates, surcharges, and expired lanes."
        actions={
          <>
            <Button variant="ghost" size="sm">Defaults</Button>
            <Button variant="ghost" size="sm" onClick={() => setShowLaneLocations(true)}>Lane locations</Button>
          </>
        }
      />

      <div className="overflow-x-auto"><Segment items={segments} value={tab} onChange={setTab} className="min-w-max" /></div>

      {tab === 'fuel' && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {fuelIndices.map((fi) => (
              <button key={fi.id} onClick={() => setSelectedIndex(fi.id)} className={cn('rounded-[16px] bg-card p-4 text-left shadow-[var(--shadow-rest)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-hover)]', selectedIndex === fi.id && 'ring-2 ring-accent')}>
                <div className="text-[12px] font-semibold text-ink-2">{fi.name}</div>
                {fi.value != null ? (
                  <>
                    <div className="mt-1 text-[18px] font-bold tabular-nums">{fi.value}{fi.unit === '%' ? '%' : fi.unit === 'cent/liter' ? ' ¢/L' : fi.unit === '$/gallon' ? ' $/gal' : ''}</div>
                    {fi.weeklyDeltaPct != null && <Pill variant={fi.trend === 'up' ? 'green' : 'red'} className="mt-1">{fi.trend === 'up' ? '↑' : '↓'} {Math.abs(fi.weeklyDeltaPct)}%</Pill>}
                    <Sparkline trend={fi.trend} />
                  </>
                ) : <div className="mt-2 text-[13px] text-ink-3">—</div>}
              </button>
            ))}
          </div>
          <Card className="p-4 sm:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-[14.5px] font-bold">{index.name} — Price History</h2>
              <div className="flex gap-1">{['3M', '6M', '1Y'].map((r) => (
                <button key={r} onClick={() => setRange(r)} className={cn('rounded-lg px-2.5 py-1 text-[12px]', range === r ? 'bg-ink text-white' : 'text-ink-2 hover:bg-black/[0.04]')}>{r === '3M' ? 'Last 3 Months' : r}</button>
              ))}</div>
            </div>
            <div className="mb-4 flex h-32 items-end gap-1">
              {(index.history.length ? index.history : [{ price: 0 }]).map((_, i) => (
                <div key={i} className="flex-1 rounded-t-lg bg-accent/20" style={{ height: `${30 + (i % 5) * 15}%`, minHeight: 8 }} />
              ))}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-[12px]">
                <thead><tr className="text-left text-[11px] font-semibold uppercase text-ink-3"><th className="pb-2">Action</th><th className="pb-2">Price</th><th className="pb-2">Week Beginning</th><th className="pb-2">Week Ending</th><th className="pb-2">Updated By</th><th className="pb-2">Updated On</th></tr></thead>
                <tbody>
                  {index.history.map((h, i) => (
                    <tr key={i} className="border-t border-line">
                      <td className="py-2.5"><div className="flex gap-1"><button className="rounded p-1 hover:bg-black/[0.05]"><Pencil size={14} strokeWidth={1.7} /></button><button className="rounded p-1 hover:bg-black/[0.05]"><Trash2 size={14} strokeWidth={1.7} /></button></div></td>
                      <td className="py-2.5 tabular-nums font-semibold">{h.price.toFixed(3)}</td>
                      <td className="py-2.5">{formatDate(h.weekBeginning)}</td>
                      <td className="py-2.5">{formatDate(h.weekEnding)}</td>
                      <td className="py-2.5">{h.updatedBy}</td>
                      <td className="py-2.5">{formatDate(h.updatedOn)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button variant="ghost" size="sm" className="mt-4"><Plus size={14} strokeWidth={1.7} /> Add weekly price</Button>
          </Card>
        </>
      )}

      {tab === 'freight' && (
        <div className="flex flex-col gap-4 xl:flex-row">
          <Card className="w-full shrink-0 overflow-hidden xl:w-[280px]">
            <div className="border-b border-line p-3">
              <div className="relative">
                <Search size={16} strokeWidth={1.7} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
                <input placeholder="Search customers…" className="h-9 w-full rounded-[10px] border border-line pl-9 pr-3 text-[13px] outline-none" />
              </div>
            </div>
            {customerConfigs.map((c) => (
              <button key={c.id} onClick={() => setSelectedCustomer(c.id)} className={cn('w-full border-b border-line px-4 py-3 text-left transition-colors', selectedCustomer === c.id ? 'bg-accent-soft' : 'hover:bg-black/[0.02]')}>
                <div className="text-[13px] font-semibold">{c.name}</div>
                <div className="text-[11px] text-ink-3">{c.lanes.toLocaleString()} Lanes · {c.orders} Orders</div>
              </button>
            ))}
          </Card>
          <Card className="min-w-0 flex-1 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line p-4">
              <h2 className="text-[14px] font-bold">{customer.name}</h2>
              <div className="flex flex-wrap gap-2">
                <Button variant="ghost" size="sm">Create</Button>
                <Button variant="ghost" size="sm">Export</Button>
                <Button variant="ghost" size="sm">Import</Button>
                <Button size="sm" onClick={() => setLaneModal(true)}>Manage Lane</Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-[12px]">
                <thead className="bg-[#FCFCFD]">
                  <tr className="text-left text-[11px] font-semibold uppercase text-ink-3">
                    <th className="px-3 py-2">☑</th><th className="px-3 py-2">Origin</th><th className="px-3 py-2">Destination</th><th className="px-3 py-2">Type</th><th className="px-3 py-2">Currency</th><th className="px-3 py-2">Distance</th><th className="px-3 py-2">FRT Method</th><th className="px-3 py-2">Multi Probill</th><th className="px-3 py-2">Updated By</th><th className="px-3 py-2">Active</th>
                  </tr>
                </thead>
                <tbody>
                  {rates.map((r) => (
                    <tr key={r.id} className="border-t border-line hover:bg-[#F7F9FC]">
                      <td className="px-3 py-2.5"><input type="checkbox" className="rounded" /></td>
                      <td className="px-3 py-2.5">{r.origin}</td>
                      <td className="px-3 py-2.5">{r.destination}</td>
                      <td className="px-3 py-2.5">{r.type}</td>
                      <td className="px-3 py-2.5">{r.currency}</td>
                      <td className="px-3 py-2.5">{r.distance}</td>
                      <td className="px-3 py-2.5">{r.frtMethod}</td>
                      <td className="px-3 py-2.5">{r.multiProbill ? '✗' : '—'}</td>
                      <td className="px-3 py-2.5 text-ink-3">{r.updatedBy}</td>
                      <td className="px-3 py-2.5"><Switch checked={r.active} onChange={() => {}} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="border-t border-line px-4 py-2 text-[11px] text-ink-3">Total: {rates.length} · 1 of 1</p>
          </Card>
        </div>
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
            <SearchInput value={customerSearch} onChange={setCustomerSearch} placeholder="Customer Name" className="w-full sm:w-64" />
          </div>
          {Object.entries(
            filteredRates.reduce<Record<string, typeof rateCards>>((acc, r) => {
              (acc[r.customer] ??= []).push(r)
              return acc
            }, {})
          ).map(([cust, cards]) => (
            <Card key={cust} className="overflow-hidden">
              <div className="border-b border-line bg-black/[0.02] px-4 py-2 font-semibold text-[13px]">− {cust}</div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-[12px]">
                  <thead><tr className="bg-[#FCFCFD] text-left text-[11px] font-semibold uppercase text-ink-3"><th className="px-3 py-2">Origin</th><th className="px-3 py-2">Destination</th><th className="px-3 py-2">O.CC</th><th className="px-3 py-2">D.CC</th><th className="px-3 py-2">Lane Type</th><th className="px-3 py-2">Equipment</th><th className="px-3 py-2">Effective</th><th className="px-3 py-2">Expiry</th><th className="px-3 py-2"></th></tr></thead>
                  <tbody>
                    {cards.map((rc) => (
                      <tr key={rc.id} className="border-t border-line">
                        <td className="px-3 py-2">{rc.origin}</td>
                        <td className="px-3 py-2">{rc.destination}</td>
                        <td className="px-3 py-2">{rc.originCountryCode}</td>
                        <td className="px-3 py-2">{rc.destinationCountryCode}</td>
                        <td className="px-3 py-2">{rc.laneTypeCode}</td>
                        <td className="px-3 py-2">{rc.equipment}</td>
                        <td className="px-3 py-2">{formatDate(rc.effectiveDate)}</td>
                        <td className="px-3 py-2"><Pill variant={daysUntil(rc.expiryDate) <= 7 ? 'red' : 'orange'}>{formatDate(rc.expiryDate)}</Pill></td>
                        <td className="px-3 py-2"><Button variant="ghost" size="sm">Renew rate</Button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ))}
        </>
      )}

      {!['fuel', 'freight', 'expired'].includes(tab) && (
        <Card className="flex flex-col items-center justify-center py-20">
          <p className="text-[15px] font-semibold">{segments.find((s) => s.id === tab)?.label}</p>
          <p className="mt-1 text-[13px] text-ink-3">Ready for data integration — all legacy fields preserved.</p>
        </Card>
      )}

      <Modal open={laneModal} onClose={() => setLaneModal(false)} title="Manage Lane" className="max-w-2xl" footer={<ModalFooter onCancel={() => setLaneModal(false)} onSave={() => setLaneModal(false)} saveLabel="Update" />}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Currency *"><div className="flex gap-3">{['USD', 'CAD', 'MXN'].map((c) => <label key={c} className="flex items-center gap-1 text-[13px]"><input type="radio" name="cur" defaultChecked={c === 'CAD'} />{c}</label>)}</div></Field>
          <Field label="Payment Term"><select className="field-input"><option>Select</option></select></Field>
          <Field label="Multi-Pro *"><select className="field-input" defaultValue="SGL"><option>SGL</option></select></Field>
          <Field label="Gallons"><input className="field-input" /></Field>
          <Field label="Distance Unit *"><div className="flex gap-2"><input className="field-input w-16" defaultValue="1" /><select className="field-input"><option>MILE</option></select></div></Field>
          <Field label="EDI Shipper Code"><input className="field-input" /></Field>
          <Field label="EDI Consignee Code"><input className="field-input" /></Field>
          <Field label="PO No."><input className="field-input" /></Field>
        </div>
        <div className="mt-4 flex flex-wrap gap-4">{['Automate Invoicing', 'Callers', 'Pre-Invoicing'].map((l) => <label key={l} className="flex items-center gap-2 text-[13px]"><input type="checkbox" />{l}</label>)}</div>
        <div className="mt-4"><p className="mb-2 text-[12px] font-semibold text-ink-2">Cargo</p><div className="grid gap-3 sm:grid-cols-3"><input placeholder="Description" className="field-input sm:col-span-3" /><input placeholder="Quantity" className="field-input" /><input placeholder="Weight" className="field-input" /></div><textarea placeholder="Notes…" className="field-input mt-3 min-h-[60px] w-full" /></div>
        <div className="mt-4"><p className="mb-2 text-[12px] font-semibold text-ink-2">Charge Requirement</p><div className="flex flex-wrap gap-4">{['Customer Default', 'Must/Not Have', 'Must Have'].map((l, i) => <label key={l} className="flex items-center gap-2 text-[13px]"><input type="radio" name="cr" defaultChecked={i === 0} />{l}</label>)}</div></div>
        <style>{`.field-input { width: 100%; border-radius: 10px; border: 1px solid var(--line); padding: 8px 12px; font-size: 13px; outline: none; }`}</style>
      </Modal>
    </motion.div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="mb-1.5 block text-[12px] font-medium text-ink-2">{label}</label>{children}</div>
}
