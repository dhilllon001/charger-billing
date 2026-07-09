import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { createColumnHelper, type RowSelectionState } from '@tanstack/react-table'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Pill } from '@/components/ui/Pill'
import { DataTable, CopyableMono } from '@/components/ui/Table'
import { consolidatedBatches } from '@/data/mock-consolidated'
import { orders } from '@/data/mock-orders'
import { formatCurrency, formatDate, avatarColor, initials } from '@/lib/format'
import { useUiStore } from '@/stores/ui-store'
import type { Order } from '@/data/models'

const columnHelper = createColumnHelper<Order>()

export function ConsolidatedPage() {
  const [selectedBatchId, setSelectedBatchId] = useState(consolidatedBatches[10]?.id ?? consolidatedBatches[0].id)
  const [customerSearch, setCustomerSearch] = useState('')
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const addToast = useUiStore((s) => s.addToast)

  const filteredBatches = consolidatedBatches.filter((b) =>
    b.customer.toLowerCase().includes(customerSearch.toLowerCase())
  )

  const batch = consolidatedBatches.find((b) => b.id === selectedBatchId)!
  const batchOrders = orders.filter((o) => batch.orderIds.includes(o.id))

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
    columnHelper.display({
      id: 'route',
      header: 'Route',
      cell: ({ row }) => (
        <span className="text-[12px]">{row.original.pickupCity} → {row.original.deliveryCity}</span>
      ),
    }),
    columnHelper.accessor('deliveryDate', { header: 'Delivered', cell: ({ getValue }) => formatDate(getValue()) }),
    columnHelper.accessor('poNo', { header: 'PO No.' }),
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
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[26px] font-bold tracking-[-0.022em]">Consolidated Invoicing</h1>
          <p className="mt-1 text-[13px] text-ink-3">Group orders by customer and generate consolidated invoices.</p>
        </div>
        <Link to="/batch-invoicing">
          <Button variant="ghost" size="sm">Batch view</Button>
        </Link>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:h-[calc(100vh-220px)]">
        <Card className="w-full shrink-0 overflow-hidden lg:w-[300px]">
          <div className="border-b border-line p-3">
            <div className="relative">
              <Search size={16} strokeWidth={1.7} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
              <input
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder="Search customers…"
                className="h-9 w-full rounded-[10px] border border-line bg-white pl-9 pr-3 text-[13px] outline-none"
              />
            </div>
          </div>
          <div className="max-h-[500px] overflow-y-auto lg:max-h-full">
            {filteredBatches.map((b) => {
              const orderCount = b.orderIds.length
              const batchCount = 1
              const active = b.id === selectedBatchId
              return (
                <button
                  key={b.id}
                  onClick={() => { setSelectedBatchId(b.id); setRowSelection({}) }}
                  className={`flex w-full items-center gap-3 border-b border-line px-4 py-3 text-left transition-colors ${active ? 'bg-accent-soft' : 'hover:bg-black/[0.02]'}`}
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                    style={{ background: avatarColor(b.customer) }}
                  >
                    {initials(b.customer)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-semibold">{b.customer}</div>
                    <div className="text-[11px] text-ink-3">{batchCount} batch · {orderCount} orders</div>
                  </div>
                </button>
              )
            })}
          </div>
        </Card>

        <Card className="flex flex-1 flex-col overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line p-5">
            <div>
              <h2 className="text-[14.5px] font-bold">{batch.customer} — {batch.batchName}</h2>
              <p className="mt-0.5 text-[12px] text-ink-3">
                {selectedIds.length || batchOrders.length} selected orders · Bill to: {batch.billToCustomer}
              </p>
            </div>
            <div className="text-right">
              <div className="text-[11px] uppercase tracking-[0.05em] text-ink-3">Invoice Total</div>
              <div className="text-[28px] font-bold tabular-nums text-ink">
                {formatCurrency(selectedIds.length ? selectedTotal : batchOrders.reduce((s, o) => s + o.invoiceAmount, 0), batch.currency)}
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4">
            <DataTable
              data={batchOrders}
              columns={columns}
              gridId="consolidated-orders"
              getRowId={(row) => row.id}
              rowSelection={rowSelection}
              onRowSelectionChange={setRowSelection}
            />
          </div>
          <div className="border-t border-line p-4 flex justify-end gap-2">
            <Link to="/batch-invoicing"><Button variant="ghost" size="sm">Batch view</Button></Link>
            <Button
              size="sm"
              onClick={() => addToast(`Consolidated invoice CI-${Date.now().toString().slice(-4)} generated · ${selectedIds.length || batchOrders.length} orders`)}
            >
              Generate invoice
            </Button>
          </div>
        </Card>
      </div>
    </motion.div>
  )
}
