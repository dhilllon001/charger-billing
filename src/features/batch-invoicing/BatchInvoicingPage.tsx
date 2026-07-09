import { useMemo, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { createColumnHelper, type RowSelectionState } from '@tanstack/react-table'
import { MoreHorizontal, ArrowRight, Sparkles, Check, Minus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Segment } from '@/components/ui/Segment'
import { SearchInput } from '@/components/ui/SearchInput'
import { FilterChip } from '@/components/ui/FilterChip'
import { Pill } from '@/components/ui/Pill'
import { DataTable, CopyableMono, TwoLineCell } from '@/components/ui/Table'
import { SelectActionBar } from '@/components/layout/SelectActionBar'
import { orders, getStageCounts } from '@/data/mock-orders'
import { formatCurrency, formatDate } from '@/lib/format'
import { useUiStore } from '@/stores/ui-store'
import type { Order, PipelineStage } from '@/data/models'

const stageCounts = getStageCounts()
const columnHelper = createColumnHelper<Order>()

const segments = [
  { id: 'all', label: 'All', count: stageCounts.all },
  { id: 'rate_validated', label: 'Rate validated', count: stageCounts.rate_validated },
  { id: 'ops_validated', label: 'Ops validated', count: stageCounts.ops_validated },
  { id: 'pod_verified', label: 'POD verified', count: stageCounts.pod_verified },
  { id: 'rfi', label: 'RFI', count: stageCounts.rfi },
  { id: 'ready', label: 'Ready', count: stageCounts.ready },
  { id: 'invoiced', label: 'Invoiced', count: stageCounts.invoiced },
  { id: 'email_delivery', label: 'Email delivery', count: stageCounts.email_delivery },
  { id: 'as', label: 'AS', count: stageCounts.as },
]

function AiCheckPill({ check }: { check: Order['aiCheck'] }) {
  if (check.state === 'auto_validated') return <Pill variant="ai">✓ Auto-validated</Pill>
  if (check.state === 'rate_variance') return <Pill variant="orange">Rate variance {check.detail}</Pill>
  if (check.state === 'pod_missing') return <Pill variant="red">POD missing</Pill>
  return <Pill variant="gray">Awaiting ops</Pill>
}

function StatusPill({ status }: { status: Order['status'] }) {
  const map = { ready: 'green', needs_review: 'orange', blocked: 'red', in_validation: 'blue' } as const
  const labels = { ready: 'Ready', needs_review: 'Needs review', blocked: 'Blocked', in_validation: 'In validation' }
  return <Pill variant={map[status]}>{labels[status]}</Pill>
}

export function BatchInvoicingPage() {
  const [searchParams] = useSearchParams()
  const [stage, setStage] = useState<PipelineStage>((searchParams.get('stage') as PipelineStage) || 'all')
  const [search, setSearch] = useState('')
  const [searchScope, setSearchScope] = useState('all')
  const [quickPod, setQuickPod] = useState(true)
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const addToast = useUiStore((s) => s.addToast)

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (stage !== 'all' && o.stage !== stage) return false
      if (search) {
        const q = search.toLowerCase()
        if (searchScope === 'order' && !o.orderNo.toLowerCase().includes(q)) return false
        if (searchScope === 'po' && !o.poNo.toLowerCase().includes(q)) return false
        if (searchScope === 'all' && !o.orderNo.toLowerCase().includes(q) && !o.poNo.toLowerCase().includes(q) && !o.customer.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [stage, search, searchScope])

  const selectedIds = Object.keys(rowSelection).filter((k) => rowSelection[k])
  const selectedTotal = filtered.filter((o) => selectedIds.includes(o.id)).reduce((s, o) => s + o.invoiceAmount, 0)

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
    columnHelper.accessor('orderNo', {
      header: 'Order No.',
      cell: ({ row }) => <CopyableMono value={row.original.orderNo} sub={`${row.original.poNo} · ${row.original.equipment}`} />,
    }),
    columnHelper.accessor('poNo', { header: 'PO No.', cell: ({ getValue }) => <CopyableMono value={getValue()} />, meta: { defaultHidden: true } }),
    columnHelper.accessor('customer', {
      header: 'Customer',
      cell: ({ row }) => <TwoLineCell primary={row.original.customer} secondary={row.original.division} />,
    }),
    columnHelper.accessor('billToCustomer', { header: 'Bill To Customer', meta: { defaultHidden: true } }),
    columnHelper.accessor('division', { header: 'Division', meta: { defaultHidden: true } }),
    columnHelper.accessor('poCategory', { header: 'PO Category', meta: { defaultHidden: true } }),
    columnHelper.accessor('poBillingStatus', {
      header: 'PO Billing Status',
      cell: ({ getValue }) => {
        const v = getValue()
        const variant = v === 'Billed' ? 'green' : v === 'Hold' ? 'orange' : 'blue'
        return <Pill variant={variant}>{v}</Pill>
      },
    }),
    columnHelper.accessor('orderDate', { header: 'Order Date', cell: ({ getValue }) => formatDate(getValue()), meta: { defaultHidden: true } }),
    columnHelper.accessor('pickUpDate', { header: 'Pick Up Date', cell: ({ getValue }) => formatDate(getValue()) }),
    columnHelper.accessor('deliveryDate', { header: 'Delivery Date', cell: ({ getValue }) => formatDate(getValue()) }),
    columnHelper.display({
      id: 'route',
      header: 'Route',
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-[12px]">
          <span>{row.original.pickupCity}, {row.original.pickupState}</span>
          <ArrowRight size={12} strokeWidth={1.7} className="text-ink-3" />
          <span>{row.original.deliveryCity}, {row.original.deliveryState}</span>
        </div>
      ),
    }),
    columnHelper.accessor('pickupLocation', { header: 'Pickup Location', meta: { defaultHidden: true } }),
    columnHelper.accessor('deliveryLocation', { header: 'Delivery Location', meta: { defaultHidden: true } }),
    columnHelper.accessor('pickupCity', { header: 'P/C', meta: { defaultHidden: true } }),
    columnHelper.accessor('pickupState', { header: 'P/S', meta: { defaultHidden: true } }),
    columnHelper.accessor('deliveryCity', { header: 'D/C', meta: { defaultHidden: true } }),
    columnHelper.accessor('deliveryState', { header: 'D/S', meta: { defaultHidden: true } }),
    columnHelper.accessor('callerName', { header: "Caller's Name", meta: { defaultHidden: true } }),
    columnHelper.accessor('invoiceAmount', {
      header: 'I. Amt',
      cell: ({ getValue }) => <span className="block text-right font-semibold tabular-nums">{formatCurrency(getValue())}</span>,
    }),
    columnHelper.accessor('invoiceAvgCount', { header: 'I. Avg./Count', meta: { defaultHidden: true } }),
    columnHelper.accessor('reasonCode', {
      header: 'Reason Code',
      cell: ({ getValue }) => getValue() ? <Pill variant="orange">{getValue()}</Pill> : '—',
      meta: { defaultHidden: true },
    }),
    columnHelper.accessor('invoiceStatus', { header: 'Invoice Status', cell: ({ getValue }) => <Pill variant="blue">{getValue()}</Pill> }),
    columnHelper.accessor('audited', {
      header: 'Audited',
      cell: ({ getValue }) => getValue() ? <Check size={16} strokeWidth={1.7} className="text-green" /> : <Minus size={16} strokeWidth={1.7} className="text-ink-3" />,
    }),
    columnHelper.accessor('draftInvoice', {
      header: 'Draft Invoice',
      cell: ({ row }) => row.original.draftInvoice ? (row.original.draftInvoiceNo ? <span className="text-accent">{row.original.draftInvoiceNo}</span> : 'Yes') : 'No',
    }),
    columnHelper.accessor('draftInvoiceNo', { header: 'Draft Invoice No', meta: { defaultHidden: true } }),
    columnHelper.accessor('status', { header: 'Status', cell: ({ getValue }) => <StatusPill status={getValue()} /> }),
    columnHelper.accessor('invoiceDue', { header: 'Invoice Due', cell: ({ getValue }) => getValue() ? formatDate(getValue()!) : '—', meta: { defaultHidden: true } }),
    columnHelper.accessor('aiCheck', { header: 'AI Check', cell: ({ getValue }) => <AiCheckPill check={getValue()} /> }),
    columnHelper.display({
      id: 'actions',
      header: '',
      cell: () => (
        <button className="rounded-lg p-1 hover:bg-black/[0.05]"><MoreHorizontal size={16} strokeWidth={1.7} /></button>
      ),
    }),
  ], [])

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[26px] font-bold tracking-[-0.022em]">Batch Invoicing</h1>
          <p className="mt-1 text-[13px] text-ink-3">Review, validate, and generate invoices across all pipeline stages.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ai" size="sm" onClick={() => addToast('AI validated 92 orders — 8 flagged for review')}>
            <Sparkles size={14} strokeWidth={1.7} /> Auto-validate all (AI)
          </Button>
          <Link to="/consolidated">
            <Button variant="ghost" size="sm">Consolidated view</Button>
          </Link>
        </div>
      </div>

      <Segment items={segments} value={stage} onChange={(id) => setStage(id as PipelineStage)} />

      <div className="flex flex-wrap items-center gap-2">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search order, PO or customer…"
          className="w-80"
          scope={{
            value: searchScope,
            onChange: setSearchScope,
            options: [
              { value: 'all', label: 'All' },
              { value: 'order', label: 'Order #' },
              { value: 'po', label: 'PO #' },
            ],
          }}
        />
        <FilterChip label="Quick POD Invoice" active={quickPod} onClick={() => setQuickPod(!quickPod)} onClear={() => setQuickPod(false)} />
        <FilterChip label="PO Billing Status: Pending" active />
        <FilterChip label="Customer" />
        <FilterChip label="Division" />
        <FilterChip label="Delivery date" />
        <FilterChip label="All filters" />
      </div>

      <DataTable
        data={filtered}
        columns={columns}
        gridId="batch-invoicing"
        getRowId={(row) => row.id}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        emptyTitle="No orders match these filters"
        emptyHint="Try adjusting your filters or search criteria"
        emptyAction={<Button variant="ghost" size="sm" onClick={() => { setSearch(''); setStage('all') }}>Clear filters</Button>}
      />

      <SelectActionBar
        count={selectedIds.length}
        total={selectedTotal}
        onClear={() => setRowSelection({})}
        onPreview={() => addToast('Opening draft preview…')}
        onGenerate={() => setRowSelection({})}
      />
    </motion.div>
  )
}
