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
import { PageHeader } from '@/components/layout/PageHeader'
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
        const map = { emailed_read: ['Emailed · read', 'green'], sent_unread: ['Sent · unread', 'blue'], not_sent: ['Not sent', 'gray'], uploaded: ['Uploaded', 'orange'] } as const
        const [label, variant] = map[getValue()]
        return <Pill variant={variant}>{label}</Pill>
      },
    }),
    columnHelper.accessor('paymentStatus', {
      header: 'Payment',
      cell: ({ row }) => {
        const p = row.original.paymentStatus
        const label = p === 'overdue' && row.original.overdueDays ? `Overdue · ${row.original.overdueDays}d` : p.charAt(0).toUpperCase() + p.slice(1)
        const variant = p === 'paid' ? 'green' : p === 'overdue' ? 'red' : p === 'open' ? 'blue' : 'gray'
        return <Pill variant={variant}>{label}</Pill>
      },
    }),
    columnHelper.display({
      id: 'actions',
      header: '',
      cell: () => <button className="rounded-lg p-1 hover:bg-black/[0.05]"><MoreHorizontal size={16} strokeWidth={1.7} /></button>,
    }),
  ], [])

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 sm:space-y-5">
      <PageHeader
        title="Invoiced"
        subtitle="Track sent invoices, delivery status, payments, and credits."
        actions={
          <Button size="sm" disabled={selectedCount === 0} onClick={() => addToast(`Sent ${selectedCount} invoices to customers`)}>
            Send to customer
          </Button>
        }
      />

      <div className="overflow-x-auto"><Segment items={segments} value={segment} onChange={setSegment} className="min-w-max" /></div>

      <div className="flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-center">
        <SearchInput value={search} onChange={setSearch} placeholder="Search invoices…" className="w-full lg:w-72" scope={{ value: 'invoice', onChange: () => {}, options: [{ value: 'invoice', label: 'Invoice #' }] }} />
        <div className="flex flex-wrap items-center gap-2">
          <FilterChip label="Customer" />
          <FilterChip label="Invoice Type" />
          <FilterChip label="Last 14 days" active onClear={() => {}} />
          <div className="flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1 text-[12px]">
            <span className="text-ink-2">Include location data</span>
            <Switch checked={includeLocation} onChange={setIncludeLocation} />
          </div>
          <Button variant="ghost" size="sm" onClick={() => exportToCsv(filtered as unknown as Record<string, unknown>[], 'invoices.csv')}>
            <Download size={14} strokeWidth={1.7} /> Export
          </Button>
        </div>
      </div>

      <DataTable data={filtered} columns={columns} gridId="invoiced" getRowId={(row) => row.id} rowSelection={rowSelection} onRowSelectionChange={setRowSelection} />
    </motion.div>
  )
}
