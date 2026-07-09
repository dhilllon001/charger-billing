import type { BatchFilters } from '@/features/batch-invoicing/batch-filters'
import type { Order } from '@/data/models'
import { formatCurrency, formatDate } from '@/lib/format'
import type { SrColumn } from '@/components/report/SrDataTable'
import { WorkflowStageBadge } from '@/components/ui/WorkflowStepper'
import { CopyableMono, TwoLineCell } from '@/components/ui/Table'
import { Check, Minus, ArrowRight } from 'lucide-react'

export function buildLegacyOrderColumns(opts: {
  onOrderClick?: (row: Order) => void
  compact?: boolean
}): SrColumn<Order>[] {
  const compact = opts.compact
  return [
    {
      key: 'orderNo',
      header: 'Order No.',
      thClassName: 'col-order',
      cell: (row) => (
        <CopyableMono value={row.orderNo} sub={compact ? row.poNo : `${row.poNo} · ${row.equipment}`} />
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      cell: (row) => <TwoLineCell primary={row.customer} secondary={row.division} />,
    },
    {
      key: 'billToCustomer',
      header: 'Bill To Customer',
      hideBelow: 'lg',
      cell: (row) => <span className="text-[11px]">{row.billToCustomer}</span>,
    },
    {
      key: 'poNo',
      header: 'PO No.',
      hideBelow: 'md',
      cell: (row) => <span className="mono text-[11px]">{row.poNo}</span>,
    },
    {
      key: 'division',
      header: 'Division',
      hideBelow: 'lg',
      cell: (row) => row.division,
    },
    {
      key: 'poCategory',
      header: 'PO Category',
      hideBelow: 'lg',
      cell: (row) => row.poCategory,
    },
    {
      key: 'poBillingStatus',
      header: 'PO Billing Status',
      hideBelow: 'md',
      cell: (row) => <span className="sr-status-text">{row.poBillingStatus}</span>,
    },
    {
      key: 'pickUpDate',
      header: 'Pick Up Date',
      hideBelow: 'md',
      cell: (row) => <span className="tabular-nums text-[11px]">{formatDate(row.pickUpDate)}</span>,
    },
    {
      key: 'deliveryDate',
      header: 'Delivery Date',
      hideBelow: 'md',
      cell: (row) => <span className="tabular-nums text-[11px]">{formatDate(row.deliveryDate)}</span>,
    },
    {
      key: 'pickupLocation',
      header: 'Pickup Location',
      hideBelow: 'lg',
      cell: (row) => <span className="truncate text-[11px]">{row.pickupLocation}</span>,
    },
    {
      key: 'pickupCity',
      header: 'P/C',
      hideBelow: 'lg',
      cell: (row) => row.pickupCity,
    },
    {
      key: 'pickupState',
      header: 'P/S',
      hideBelow: 'lg',
      cell: (row) => row.pickupState,
    },
    {
      key: 'deliveryLocation',
      header: 'Delivery Location',
      hideBelow: 'lg',
      cell: (row) => <span className="truncate text-[11px]">{row.deliveryLocation}</span>,
    },
    {
      key: 'deliveryCity',
      header: 'D/C',
      hideBelow: 'lg',
      cell: (row) => row.deliveryCity,
    },
    {
      key: 'deliveryState',
      header: 'D/S',
      hideBelow: 'lg',
      cell: (row) => row.deliveryState,
    },
    {
      key: 'route',
      header: 'Route',
      hideBelow: 'md',
      cell: (row) => (
        <div className="sr-cell-route">
          <span className="sr-cell-route__city">{row.pickupCity}</span>
          <ArrowRight size={11} strokeWidth={2} className="opacity-40" />
          <span className="sr-cell-route__city">{row.deliveryCity}</span>
        </div>
      ),
    },
    {
      key: 'invoiceAmount',
      header: 'Invoice Total',
      align: 'right',
      thClassName: 'col-amount',
      filter: { type: 'range' },
      cell: (row) => <span className="sr-cell-amount">{formatCurrency(row.invoiceAmount)}</span>,
    },
    {
      key: 'workflow',
      header: 'Stage',
      thClassName: 'col-stage',
      cell: (row) =>
        row.workflow ? <WorkflowStageBadge workflow={row.workflow} compact /> : <span className="sr-status-text--muted">—</span>,
    },
    {
      key: 'audited',
      header: 'Audited',
      hideBelow: 'lg',
      cell: (row) =>
        row.audited ? <Check size={14} className="text-[var(--sr-positive)]" /> : <Minus size={14} className="text-[var(--sr-text-disabled)]" />,
    },
  ]
}

export type ExtendedBatchFilters = BatchFilters

export { EQUIPMENT_OPTIONS } from '@/features/batch-invoicing/batch-filters'
