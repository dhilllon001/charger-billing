import type { Order } from '@/data/models'
import type { SrColumn } from '@/components/report/SrDataTable'
import type { HoverDetail } from '@/components/report/RowHoverPopover'
import { BatchRowActionsMenu } from '@/components/batch/BatchRowActionsMenu'
import { getCurrentWorkflowStage } from '@/components/ui/WorkflowStepper'
import { formatCurrency, formatDateTimeCompact } from '@/lib/format'
import { cn } from '@/lib/cn'

function TwoLine({
  primary,
  secondary,
  align,
}: {
  primary: React.ReactNode
  secondary?: React.ReactNode
  align?: 'right'
}) {
  const showSecondary = secondary != null && secondary !== '' && secondary !== '—'
  return (
    <div className={cn('sr-cell-stack', align === 'right' && 'sr-cell-stack--right')}>
      <span className="sr-cell-stack__primary">{primary}</span>
      {showSecondary && <span className="sr-cell-stack__secondary">{secondary}</span>}
    </div>
  )
}

function BillingPill({ status }: { status: Order['poBillingStatus'] }) {
  const tone =
    status === 'Billed' ? 'sr-status-pill--positive' : status === 'Hold' ? 'sr-status-pill--warning' : 'sr-status-pill--action'
  return <span className={cn('sr-status-pill', tone)}>{status}</span>
}

function StagePill({ order }: { order: Order }) {
  if (!order.workflow) {
    const labels: Record<string, string> = {
      rate_validated: 'Rate validated',
      ops_validated: 'Ops validated',
      pod_verified: 'POD Validation',
      rfi: 'RFI',
      invoiced: 'Invoiced',
      email_delivery: 'Email delivery',
      as: 'Accounting Sync',
      ready: 'Ready',
    }
    return <span className="sr-status-pill sr-status-pill--neutral">{labels[order.stage] ?? order.stage}</span>
  }
  const current = getCurrentWorkflowStage(order.workflow)
  const tone =
    current.status === 'failed'
      ? 'sr-status-pill--negative'
      : current.status === 'warning'
        ? 'sr-status-pill--warning'
        : current.status === 'passed'
          ? 'sr-status-pill--positive'
          : current.status === 'pending'
            ? 'sr-status-pill--action'
            : 'sr-status-pill--neutral'
  return <span className={cn('sr-status-pill', tone)}>{current.label}</span>
}

function stageSecondary(order: Order): string {
  if (order.workflow) return getCurrentWorkflowStage(order.workflow).detail
  return order.invoiceStatus || '—'
}

function trunc(value: string, max = 28) {
  if (!value) return '—'
  return value.length > max ? `${value.slice(0, max)}…` : value
}

function locationLine(city: string, state: string) {
  if (city && state) return `${city}, ${state}`
  return city || state || '—'
}

export function batchHoverTitle(order: Order) {
  return order.orderNo
}

export function batchHoverSubtitle(order: Order) {
  return order.customer
}

export function batchHoverDetails(order: Order): HoverDetail[] {
  return [
    { label: 'PO', value: order.poNo },
    { label: 'Amount', value: formatCurrency(order.invoiceAmount, order.currency) },
    { label: 'Billing', value: order.poBillingStatus },
    { label: 'Pickup', value: formatDateTimeCompact(order.pickUpDate) },
    { label: 'Delivery', value: formatDateTimeCompact(order.deliveryDate) },
    { label: 'Route', value: `${order.pickupCity} → ${order.deliveryCity}` },
  ]
}

/** Grouped two-line columns — action menu + stage first */
export function buildBatchGroupedColumns(): SrColumn<Order>[] {
  return [
    {
      key: 'actions',
      header: '',
      thClassName: 'batch-col-action',
      className: 'batch-col-action',
      cell: (row) => (
        <div className="batch-row-menu-wrap">
          <BatchRowActionsMenu order={row} />
        </div>
      ),
    },
    {
      key: 'stage',
      header: 'Stage',
      thClassName: 'batch-col-stage',
      className: 'batch-col-stage',
      cell: (row) => (
        <TwoLine primary={<StagePill order={row} />} secondary={stageSecondary(row)} />
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      thClassName: 'batch-col-customer',
      className: 'batch-col-customer',
      filter: { type: 'text' },
      cell: (row) => (
        <TwoLine
          primary={trunc(row.customer, 32)}
          secondary={`Bill to – ${trunc(row.billToCustomer, 28)}`}
        />
      ),
    },
    {
      key: 'orderNo',
      header: 'Order No.',
      thClassName: 'batch-col-order',
      className: 'batch-col-order',
      filter: { type: 'text' },
      cell: (row) => (
        <TwoLine
          primary={<span className="mono rep-name">{row.orderNo}</span>}
          secondary={<span className="mono">PO {row.poNo}</span>}
        />
      ),
    },
    {
      key: 'division',
      header: 'Division',
      thClassName: 'batch-col-division',
      className: 'batch-col-division',
      cell: (row) => (
        <TwoLine primary={trunc(row.division, 24)} secondary={row.poCategory} />
      ),
    },
    {
      key: 'poBilling',
      header: 'PO Billing',
      thClassName: 'batch-col-billing',
      className: 'batch-col-billing',
      cell: (row) => (
        <TwoLine
          primary={<BillingPill status={row.poBillingStatus} />}
          secondary={row.invoiceStatus}
        />
      ),
    },
    {
      key: 'dates',
      header: 'Pick Up / Delivery',
      thClassName: 'batch-col-dates',
      className: 'batch-col-dates',
      cell: (row) => (
        <TwoLine
          primary={formatDateTimeCompact(row.pickUpDate)}
          secondary={formatDateTimeCompact(row.deliveryDate)}
        />
      ),
    },
    {
      key: 'invoiceAmount',
      header: 'I.Amt',
      align: 'right',
      thClassName: 'batch-col-amount',
      className: 'batch-col-amount',
      filter: { type: 'range' },
      cell: (row) => (
        <TwoLine
          align="right"
          primary={<span className="mono rep-name">{formatCurrency(row.invoiceAmount, row.currency)}</span>}
          secondary={row.invoiceAvgCount}
        />
      ),
    },
    {
      key: 'pickup',
      header: 'Pickup',
      thClassName: 'batch-col-location',
      className: 'batch-col-location',
      hideBelow: 'lg',
      cell: (row) => (
        <TwoLine
          primary={trunc(row.pickupLocation, 26)}
          secondary={locationLine(row.pickupCity, row.pickupState)}
        />
      ),
    },
    {
      key: 'delivery',
      header: 'Delivery',
      thClassName: 'batch-col-location',
      className: 'batch-col-location',
      hideBelow: 'lg',
      cell: (row) => (
        <TwoLine
          primary={trunc(row.deliveryLocation, 26)}
          secondary={locationLine(row.deliveryCity, row.deliveryState)}
        />
      ),
    },
    {
      key: 'caller',
      header: "Caller's Name",
      thClassName: 'batch-col-caller',
      className: 'batch-col-caller',
      hideBelow: 'lg',
      cell: (row) => (
        <TwoLine primary={row.callerName || '—'} secondary={row.equipment} />
      ),
    },
    {
      key: 'orderDate',
      header: 'Order / Due',
      thClassName: 'batch-col-order-date',
      className: 'batch-col-order-date',
      hideBelow: 'lg',
      cell: (row) => (
        <TwoLine
          primary={formatDateTimeCompact(row.orderDate)}
          secondary={row.invoiceDue ? formatDateTimeCompact(row.invoiceDue) : '—'}
        />
      ),
    },
    {
      key: 'reason',
      header: 'Reason / Audited',
      thClassName: 'batch-col-reason',
      className: 'batch-col-reason',
      hideBelow: 'xl',
      cell: (row) => (
        <TwoLine
          primary={row.reasonCode || '—'}
          secondary={row.audited ? 'Audited' : 'Not audited'}
        />
      ),
    },
    {
      key: 'draft',
      header: 'Draft Invoice',
      thClassName: 'batch-col-draft',
      className: 'batch-col-draft',
      hideBelow: 'xl',
      cell: (row) => (
        <TwoLine
          primary={row.draftInvoice ? 'Yes' : 'No'}
          secondary={row.draftInvoiceNo ?? '—'}
        />
      ),
    },
  ]
}
