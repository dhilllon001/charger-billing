import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { createColumnHelper, type RowSelectionState } from '@tanstack/react-table'
import { MoreHorizontal, Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Segment } from '@/components/ui/Segment'
import { SearchInput } from '@/components/ui/SearchInput'
import { FilterChip } from '@/components/ui/FilterChip'
import { Switch } from '@/components/ui/Switch'
import { Pill } from '@/components/ui/Pill'
import { DataTable, CopyableMono } from '@/components/ui/Table'
import { invoices, getInvoiceSegmentCounts } from '@/data/mock-invoices'
import { formatCurrency, formatDate } from '@/lib/format'
import { useUiStore } from '@/stores/ui-store'
import { exportToCsv } from '@/lib/csv'
import type { Invoice } from '@/data/models'

const counts = getInvoiceSegmentCounts()
const segments = [
  { id: 'all', label: 'All', count: counts.all },
  { id: 'sent', label: 'Sent', count: counts.sent },
  { id: 'not_sent', label: 'Not sent', count: counts.not_sent },
  { id: 'overdue', label: 'Overdue', count: counts.overdue },
  { id: 'credits', label: 'Credits', count: counts.credits },
]

const columnHelper = createColumnHelper<Invoice>()

export function InvoicedPage() {
  const [segment, setSegment] = useState('all')
  const [search, setSearch] = useState('')
  const [includeLocation, setIncludeLocation] = useState(false)
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const addToast = useUiStore((s) => s.addToast)

  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      if (segment === 'sent' && !(inv.deliveryStatus === 'emailed_read' || inv.deliveryStatus === 'sent_unread')) return false
      if (segment === 'not_sent' && inv.deliveryStatus !== 'not_sent') return false
      if (segment === 'overdue' && inv.paymentStatus !== 'overdue') return false
      if (segment === 'credits' && inv.invoiceType !== 'Credit note') return false
      if (search && !inv.invoiceNo.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [segment, search])

  const selectedCount = Object.keys(rowSelection).filter((k) => rowSelection[k]).length

  const deliveryLabels: Record<Invoice['deliveryStatus'], { label: string; variant: 'green' | 'blue' | 'gray' | 'orange' }> = {
    emailed_read: { label: 'Emailed · read', variant: 'green' },
    sent_unread: { label: 'Sent · unread', variant: 'blue' },
    not_sent: { label: 'Not sent', variant: 'gray' },
    uploaded: { label: 'Uploaded', variant: 'orange' },
  }

  const paymentLabels: Record<Invoice['paymentStatus'], { label: string; variant: 'green' | 'blue' | 'red' | 'gray' | 'orange' }> = {
    open: { label: 'Open', variant: 'blue' },
    paid: { label: 'Paid', variant: 'green' },
    overdue: { label: `Overdue · ${0}d`, variant: 'red' },
    draft: { label: 'Draft', variant: 'gray' },
    applied: { label: 'Applied', variant: 'green' },
  }

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
    columnHelper.accessor('invoiceNo', {
      header: 'Invoice #',
      cell: ({ row }) => (
        <CopyableMono
          value={row.original.invoiceNo}
          sub={row.original.consolidatedOrderCount ? `Consolidated · ${row.original.consolidatedOrderCount} orders` : row.original.orderNo}
        />
      ),
    }),
    columnHelper.accessor('currency', { header: 'Currency', meta: { defaultHidden: true } }),
    columnHelper.accessor('customer', { header: 'Customer', cell: ({ getValue }) => <span className="font-semibold">{getValue()}</span> }),
    columnHelper.accessor('billCustomerName', { header: 'B. Customer Name', meta: { defaultHidden: true } }),
    columnHelper.accessor('divName', { header: 'Div Name', meta: { defaultHidden: true } }),
    columnHelper.accessor('orderNo', { header: 'Order No', meta: { defaultHidden: true } }),
    columnHelper.accessor('invoiceType', { header: 'I. Type', cell: ({ getValue }) => <Pill variant="blue">{getValue()}</Pill> }),
    columnHelper.accessor('totalOrders', { header: 'T. Order', meta: { defaultHidden: true } }),
    columnHelper.accessor('deliveryDate', { header: 'Delivery Date', cell: ({ getValue }) => getValue() ? formatDate(getValue()!) : '—', meta: { defaultHidden: true } }),
    columnHelper.accessor('poNo', { header: 'PO No.', meta: { defaultHidden: true } }),
    columnHelper.accessor('invoicedDate', { header: 'Invoiced Date', cell: ({ getValue }) => formatDate(getValue()) }),
    columnHelper.accessor('invoiceDue', { header: 'Invoice Due', cell: ({ getValue }) => getValue() ? formatDate(getValue()!) : '—' }),
    columnHelper.accessor('total', {
      header: 'I. Total',
      cell: ({ getValue, row }) => (
        <span className={`block text-right font-semibold tabular-nums ${row.original.invoiceType === 'Credit note' ? 'text-red' : ''}`}>
          {formatCurrency(getValue(), row.original.currency)}
        </span>
      ),
    }),
    columnHelper.accessor('invoicedBy', { header: 'Invoiced By', meta: { defaultHidden: true } }),
    columnHelper.accessor('adjustedTotal', { header: 'Adj. Total', meta: { defaultHidden: true } }),
    columnHelper.accessor('deliveryMethod', { header: 'D. Method', meta: { defaultHidden: true } }),
    columnHelper.accessor('deliveryStatus', {
      header: 'Delivery status',
      cell: ({ getValue }) => {
        const d = deliveryLabels[getValue()]
        return <Pill variant={d.variant}>{d.label}</Pill>
      },
    }),
    columnHelper.accessor('paymentStatus', {
      header: 'Payment',
      cell: ({ row }) => {
        const p = paymentLabels[row.original.paymentStatus]
        const label = row.original.paymentStatus === 'overdue' && row.original.overdueDays
          ? `Overdue · ${row.original.overdueDays}d`
          : p.label
        return <Pill variant={p.variant}>{label}</Pill>
      },
    }),
    columnHelper.display({
      id: 'actions',
      header: '',
      cell: () => <button className="rounded-lg p-1 hover:bg-black/[0.05]"><MoreHorizontal size={16} strokeWidth={1.7} /></button>,
    }),
  ], [])

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[26px] font-bold tracking-[-0.022em]">Invoiced</h1>
          <p className="mt-1 text-[13px] text-ink-3">Manage sent invoices, delivery status, and payments.</p>
        </div>
        <Button
          size="sm"
          disabled={selectedCount === 0}
          onClick={() => addToast(`Sent ${selectedCount} invoices to customers`)}
        >
          Send to customer
        </Button>
      </div>

      <Segment items={segments} value={segment} onChange={setSegment} />

      <div className="flex flex-wrap items-center gap-2">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search invoices…"
          className="w-72"
          scope={{
            value: 'invoice',
            onChange: () => {},
            options: [{ value: 'invoice', label: 'Invoice #' }],
          }}
        />
        <FilterChip label="Customer" />
        <FilterChip label="Invoice Type" />
        <FilterChip label="Last 14 days" active onClear={() => {}} />
        <div className="flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1 text-[12px]">
          <span className="text-ink-2">Include location data</span>
          <Switch checked={includeLocation} onChange={setIncludeLocation} />
        </div>
        <div className="ml-auto">
          <Button variant="ghost" size="sm" onClick={() => exportToCsv(filtered as unknown as Record<string, unknown>[], 'invoices.csv')}>
            <Download size={14} strokeWidth={1.7} /> Export
          </Button>
        </div>
      </div>

      <DataTable
        data={filtered}
        columns={columns}
        gridId="invoiced"
        getRowId={(row) => row.id}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
      />
    </motion.div>
  )
}
