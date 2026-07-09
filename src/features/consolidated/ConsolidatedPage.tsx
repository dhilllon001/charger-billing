import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { createColumnHelper, type RowSelectionState } from '@tanstack/react-table'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Segment } from '@/components/ui/Segment'
import { Card } from '@/components/ui/Card'
import { Pill } from '@/components/ui/Pill'
import { DataTable, CopyableMono } from '@/components/ui/Table'
import { PageHeader } from '@/components/layout/PageHeader'
import { consolidatedBatches } from '@/data/mock-consolidated'
import { orders } from '@/data/mock-orders'
import { consolidatedValidationGroups } from '@/data/validation-filters'
import { formatCurrency, formatDate, avatarColor, initials } from '@/lib/format'
import { useUiStore } from '@/stores/ui-store'
import type { Order } from '@/data/models'
import { cn } from '@/lib/cn'

const columnHelper = createColumnHelper<Order>()

const segments = [
  { id: 'all', label: 'All', count: 11 },
  { id: 'rate_validated', label: 'Rate validated', count: 4 },
  { id: 'ops_validated', label: 'Ops validated', count: 0 },
  { id: 'pod_verified', label: 'POD Validation', count: 0 },
  { id: 'rfi', label: 'RFI', count: 1 },
  { id: 'invoiced', label: 'Invoiced', count: 0 },
  { id: 'email_delivery', label: 'Email delivery', count: 0 },
  { id: 'as', label: 'AS', count: 0 },
]

export function ConsolidatedPage() {
  const [selectedBatchId, setSelectedBatchId] = useState(consolidatedBatches[10]?.id ?? consolidatedBatches[0].id)
  const [customerSearch, setCustomerSearch] = useState('')
  const [stage, setStage] = useState('all')
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const addToast = useUiStore((s) => s.addToast)

  const filteredBatches = consolidatedBatches.filter((b) =>
    b.customer.toLowerCase().includes(customerSearch.toLowerCase())
  )

  const batch = consolidatedBatches.find((b) => b.id === selectedBatchId)!
  const batchOrders = orders.filter((o) => batch.orderIds.includes(o.id))

  const groupedOrders = useMemo(() => {
    const groups = consolidatedValidationGroups.map((g) => ({
      ...g,
      orders: batchOrders.filter((o) => o.validationGroup === g.id),
    }))
    const ungrouped = batchOrders.filter((o) => !o.validationGroup)
    if (ungrouped.length) groups.push({ id: 'other', label: 'Other', count: ungrouped.length, orders: ungrouped })
    return groups.filter((g) => g.orders.length > 0)
  }, [batchOrders])

  const selectedIds = Object.keys(rowSelection).filter((k) => rowSelection[k])
  const selectedTotal = batchOrders.filter((o) => selectedIds.includes(o.id)).reduce((s, o) => s + o.invoiceAmount, 0)

  const columns = useMemo(() => [
    columnHelper.display({
      id: 'select',
      header: ({ table }) => (
        <input type="checkbox" checked={table.getIsAllPageRowsSelected()} onChange={table.getToggleAllPageRowsSelectedHandler()} className="rounded" />
      ),
      cell: ({ row }) => (
        <input type="checkbox" checked={row.getIsSelected()} onChange={row.getToggleSelectedHandler()} className="rounded" />
      ),
    }),
    columnHelper.accessor('orderNo', { header: 'Order No.', cell: ({ getValue }) => <CopyableMono value={getValue()} /> }),
    columnHelper.accessor('customer', { header: 'Customer' }),
    columnHelper.accessor('billToCustomer', { header: 'Bill To Customer', meta: { defaultHidden: true } }),
    columnHelper.accessor('poNo', { header: 'PO No.' }),
    columnHelper.accessor('division', { header: 'Division', meta: { defaultHidden: true } }),
    columnHelper.accessor('poCategory', { header: 'PO Category', meta: { defaultHidden: true } }),
    columnHelper.accessor('poBillingStatus', { header: 'PO Billing Status', cell: ({ getValue }) => <Pill variant="blue">{getValue()}</Pill> }),
    columnHelper.accessor('pickUpDate', { header: 'Pick Up Date', cell: ({ getValue }) => formatDate(getValue()), meta: { defaultHidden: true } }),
    columnHelper.accessor('deliveryDate', { header: 'Delivery Date', cell: ({ getValue }) => formatDate(getValue()) }),
    columnHelper.accessor('pickupLocation', { header: 'Pickup Location', meta: { defaultHidden: true } }),
    columnHelper.accessor('invoiceAmount', {
      header: 'Amount',
      cell: ({ getValue }) => <span className="tabular-nums font-semibold">{formatCurrency(getValue())}</span>,
    }),
    columnHelper.accessor('aiCheck', {
      header: 'Checks',
      cell: ({ row }) => (
        <Pill variant={row.original.aiCheck.state === 'auto_validated' ? 'green' : 'orange'}>
          {row.original.aiCheck.state === 'auto_validated' ? 'Passed' : 'Review'}
        </Pill>
      ),
    }),
  ], [])

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
          </div>
          <div className="max-h-[320px] overflow-y-auto xl:max-h-full">
            {filteredBatches.map((b) => {
              const orderCount = b.orderIds.length
              const active = b.id === selectedBatchId
              return (
                <button
                  key={b.id}
                  onClick={() => { setSelectedBatchId(b.id); setRowSelection({}) }}
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
                {formatCurrency(selectedIds.length ? selectedTotal : batchOrders.reduce((s, o) => s + o.invoiceAmount, 0), batch.currency)}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4 space-y-4">
            {groupedOrders.map((group) => (
              <div key={group.id}>
                <button className="mb-2 flex items-center gap-2 text-[13px] font-semibold text-ink">
                  <span className="rounded-lg bg-black/[0.05] px-2 py-0.5 text-[11px] tabular-nums">{group.label} ({group.orders.length})</span>
                </button>
                <DataTable
                  data={group.orders}
                  columns={columns}
                  gridId={`consolidated-${group.id}`}
                  getRowId={(row) => row.id}
                  rowSelection={rowSelection}
                  onRowSelectionChange={setRowSelection}
                />
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-end gap-2 border-t border-line p-4">
            <Link to="/batch-invoicing"><Button variant="ghost" size="sm">Batch view</Button></Link>
            <Button size="sm" onClick={() => addToast(`Consolidated invoice CI-${Date.now().toString().slice(-4)} generated · ${selectedIds.length || batchOrders.length} orders`)}>
              Generate invoice
            </Button>
          </div>
        </Card>
      </div>
    </motion.div>
  )
}
