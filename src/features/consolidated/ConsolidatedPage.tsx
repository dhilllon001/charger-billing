import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Segment } from '@/components/ui/Segment'
import { Card } from '@/components/ui/Card'
import { SearchInput } from '@/components/ui/SearchInput'
import { PageHeader } from '@/components/layout/PageHeader'
import { SrDataTable } from '@/components/report/SrDataTable'
import { consolidatedBatches } from '@/data/mock-consolidated'
import { orders } from '@/data/mock-orders'
import { consolidatedValidationGroups } from '@/data/validation-filters'
import { formatCurrency, avatarColor, initials } from '@/lib/format'
import { useUiStore } from '@/stores/ui-store'
import { buildLegacyOrderColumns } from '@/lib/legacy-order-columns'
import { matchesPipelineStage } from '@/features/batch-invoicing/batch-filters'
import { cn } from '@/lib/cn'

const PIPELINE_IDS = ['all', 'rate_validated', 'ops_validated', 'pod_verified', 'rfi', 'invoiced', 'email_delivery', 'as'] as const

export function ConsolidatedPage() {
  const [selectedBatchId, setSelectedBatchId] = useState(consolidatedBatches[10]?.id ?? consolidatedBatches[0].id)
  const [customerSearch, setCustomerSearch] = useState('')
  const [stage, setStage] = useState('all')
  const [orderSearch, setOrderSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const addToast = useUiStore((s) => s.addToast)

  const filteredBatches = consolidatedBatches.filter((b) =>
    b.customer.toLowerCase().includes(customerSearch.toLowerCase())
  )

  const batch = consolidatedBatches.find((b) => b.id === selectedBatchId)!
  const batchOrders = useMemo(
    () => orders.filter((o) => batch.orderIds.includes(o.id)),
    [batch.orderIds]
  )

  const stageFilteredOrders = useMemo(() => {
    return batchOrders.filter((o) => {
      if (!matchesPipelineStage(o, stage)) return false
      if (orderSearch) {
        const q = orderSearch.toLowerCase()
        if (!o.orderNo.toLowerCase().includes(q) && !o.poNo.toLowerCase().includes(q) && !o.customer.toLowerCase().includes(q))
          return false
      }
      if (dateFrom && o.deliveryDate < dateFrom) return false
      if (dateTo && o.deliveryDate > dateTo) return false
      return true
    })
  }, [batchOrders, stage, orderSearch, dateFrom, dateTo])

  const segments = useMemo(
    () =>
      PIPELINE_IDS.map((id) => ({
        id,
        label:
          id === 'all'
            ? 'All'
            : id === 'pod_verified'
              ? 'POD Validation'
              : id === 'email_delivery'
                ? 'Email Invoice Delivery'
                : id.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        count: batchOrders.filter((o) => matchesPipelineStage(o, id)).length,
      })),
    [batchOrders]
  )

  const groupedOrders = useMemo(() => {
    const groups = consolidatedValidationGroups.map((g) => ({
      ...g,
      orders: stageFilteredOrders.filter((o) => o.validationGroup === g.id),
    }))
    const ungrouped = stageFilteredOrders.filter((o) => !o.validationGroup)
    if (ungrouped.length) groups.push({ id: 'other', label: 'Other', count: ungrouped.length, orders: ungrouped })
    return groups.filter((g) => g.orders.length > 0)
  }, [stageFilteredOrders])

  const selectedTotal = stageFilteredOrders.filter((o) => selectedIds.has(o.id)).reduce((s, o) => s + o.invoiceAmount, 0)
  const columns = useMemo(() => buildLegacyOrderColumns({ compact: true }), [])

  const toggleRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = (ids: string[]) => {
    setSelectedIds((prev) => {
      const allOn = ids.every((id) => prev.has(id))
      if (allOn) return new Set()
      return new Set(ids)
    })
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 sm:space-y-5">
      <PageHeader
        title="Consolidated Invoicing"
        subtitle="Select a customer batch, review validation groups, and generate a consolidated invoice."
        actions={<Link to="/batch-invoicing"><Button size="sm">Batch Invoicing</Button></Link>}
      />

      <div className="overflow-x-auto">
        <Segment items={segments} value={stage} onChange={setStage} className="min-w-max" />
      </div>

      <div className="flex flex-col gap-4 xl:flex-row xl:min-h-[calc(100vh-280px)]">
        <Card className="w-full shrink-0 overflow-hidden xl:w-[300px]">
          <div className="border-b border-line p-3">
            <div className="relative">
              <Search size={16} strokeWidth={1.7} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
              <input
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder="Search customers…"
                className="h-9 w-full rounded-[10px] border border-line bg-white pl-9 pr-3 text-[13px] outline-none focus:ring-2 focus:ring-accent-soft"
              />
            </div>
            <p className="mt-2 text-[11px] text-ink-3">{filteredBatches.length} customers · {consolidatedBatches.length} batches</p>
          </div>
          <div className="max-h-[320px] overflow-y-auto xl:max-h-full">
            {filteredBatches.map((b) => {
              const orderCount = b.orderIds.length
              const active = b.id === selectedBatchId
              return (
                <button
                  key={b.id}
                  onClick={() => { setSelectedBatchId(b.id); setSelectedIds(new Set()) }}
                  className={cn(
                    'flex w-full items-center gap-3 border-b border-line px-4 py-3 text-left transition-colors',
                    active ? 'bg-accent-soft' : 'hover:bg-black/[0.02]'
                  )}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ background: avatarColor(b.customer) }}>
                    {initials(b.customer)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-semibold">{b.customer}</div>
                    <div className="text-[11px] text-ink-3">1 batch · {orderCount} orders</div>
                  </div>
                </button>
              )
            })}
          </div>
        </Card>

        <Card className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div>
              <h2 className="text-[14.5px] font-bold">{batch.customer} — {batch.batchName}</h2>
              <p className="mt-0.5 text-[12px] text-ink-3">Bill to: {batch.billToCustomer}</p>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-[11px] uppercase tracking-[0.05em] text-ink-3">Invoice Total</div>
              <div className="text-[24px] font-bold tabular-nums sm:text-[28px]">
                {formatCurrency(selectedIds.size ? selectedTotal : stageFilteredOrders.reduce((s, o) => s + o.invoiceAmount, 0), batch.currency)}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3">
            <SearchInput value={orderSearch} onChange={setOrderSearch} placeholder="Order # or keyword…" className="w-full sm:w-56" />
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="rounded-lg border border-line px-2 py-1.5 text-[12px]" title="Date from" />
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="rounded-lg border border-line px-2 py-1.5 text-[12px]" title="Date to" />
            <span className="ml-auto text-[11px] text-ink-3">{stageFilteredOrders.length} orders</span>
          </div>

          <div className="flex-1 overflow-auto p-4 space-y-4">
            {groupedOrders.length === 0 ? (
              <div className="py-16 text-center text-[13px] text-ink-3">No orders match the current filters.</div>
            ) : (
              groupedOrders.map((group) => (
                <div key={group.id}>
                  <div className="mb-2 flex items-center gap-2 text-[13px] font-semibold text-ink">
                    <span className="rounded-lg bg-black/[0.05] px-2 py-0.5 text-[11px] tabular-nums">{group.label} ({group.orders.length})</span>
                  </div>
                  <SrDataTable
                    rows={group.orders}
                    columns={columns}
                    responsive
                    selectedIds={selectedIds}
                    onToggleRow={toggleRow}
                    onToggleAll={toggleAll}
                    emptyTitle="No orders in this group"
                  />
                </div>
              ))
            )}
          </div>

          <div className="flex flex-wrap justify-end gap-2 border-t border-line p-4">
            <Link to="/batch-invoicing"><Button variant="ghost" size="sm">Batch view</Button></Link>
            <Button size="sm" onClick={() => addToast(`Consolidated invoice CI-${Date.now().toString().slice(-4)} generated · ${selectedIds.size || stageFilteredOrders.length} orders`)}>
              Generate invoice
            </Button>
          </div>
        </Card>
      </div>
    </motion.div>
  )
}
