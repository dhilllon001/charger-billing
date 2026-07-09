import { Plus, Tag } from 'lucide-react'
import type { Order } from '@/data/models'
import type { SrColumn } from '@/components/report/SrDataTable'
import { getCurrentWorkflowStage } from '@/components/ui/WorkflowStepper'
import { formatCurrency, formatDateTimeCompact } from '@/lib/format'
import { cn } from '@/lib/cn'

function TwoLine({
  primary,
  secondary,
  primaryClassName,
  align,
}: {
  primary: React.ReactNode
  secondary?: React.ReactNode
  primaryClassName?: string
  align?: 'right'
}) {
  return (
    <div className={cn('batch-cell', align === 'right' && 'batch-cell--right')}>
      <div className={cn('batch-cell__primary', primaryClassName)}>{primary}</div>
      {secondary != null && secondary !== '' && secondary !== '—' && (
        <div className="batch-cell__secondary">{secondary}</div>
      )}
    </div>
  )
}

function CountryFlag({ currency }: { currency?: string }) {
  const isUS = currency === 'USD'
  return (
    <span className="batch-flag" title={isUS ? 'United States' : 'Canada'}>
      {isUS ? '🇺🇸' : '🇨🇦'}
    </span>
  )
}

function CurrentStagePill({ order }: { order: Order }) {
  if (!order.workflow) {
    const stageLabels: Record<string, string> = {
      rate_validated: 'Rate validated',
      ops_validated: 'Ops validated',
      pod_verified: 'POD Validation',
      rfi: 'RFI',
      invoiced: 'Invoiced',
      email_delivery: 'Email delivery',
      as: 'Accounting Sync',
      ready: 'Ready',
    }
    const label = stageLabels[order.stage] ?? order.stage
    return <span className="batch-stage-pill">{label}</span>
  }
  const current = getCurrentWorkflowStage(order.workflow)
  return (
    <span className={cn('batch-stage-pill', `batch-stage-pill--${current.status}`)}>
      {current.label}
    </span>
  )
}

function truncateLoc(value: string, max = 28) {
  return value.length > max ? `${value.slice(0, max)}…` : value
}

/** Cleaner default columns — extended fields on row click */
export function buildBatchGroupedColumns(): SrColumn<Order>[] {
  return [
    {
      key: 'indicators',
      header: '',
      thClassName: 'col-indicators',
      cell: (row) => (
        <div className="batch-indicators">
          <button type="button" className="batch-indicators__btn" title="Expand" onClick={(e) => e.stopPropagation()}>
            <Plus size={12} strokeWidth={2} />
          </button>
          <div className="batch-indicators__meta">
            <CountryFlag currency={row.currency} />
            {row.hasPod && <span className="batch-pod-badge">POD</span>}
            <button type="button" className="batch-indicators__tag" title="Rates" onClick={(e) => e.stopPropagation()}>
              <Tag size={11} strokeWidth={2} />
            </button>
          </div>
        </div>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      thClassName: 'col-customer',
      filter: { type: 'text' },
      cell: (row) => (
        <TwoLine
          primary={<span title={row.customer}>{truncateLoc(row.customer, 32)}</span>}
          secondary={<span title={row.billToCustomer}>Bill to · {truncateLoc(row.billToCustomer, 28)}</span>}
        />
      ),
    },
    {
      key: 'orderNo',
      header: 'Order',
      thClassName: 'col-order',
      cell: (row) => (
        <TwoLine
          primary={<span className="mono">{row.orderNo}</span>}
          secondary={
            <span className="mono">
              PO {row.poNo} · {row.poCategory} · {row.poBillingStatus}
            </span>
          }
        />
      ),
    },
    {
      key: 'division',
      header: 'Division',
      thClassName: 'col-division',
      hideBelow: 'lg',
      cell: (row) => (
        <TwoLine
          primary={<span title={row.division}>{truncateLoc(row.division, 22)}</span>}
          secondary={row.callerName ? `${row.callerName} · ${row.equipment}` : row.equipment}
        />
      ),
    },
    {
      key: 'dates',
      header: 'Schedule',
      thClassName: 'col-dates',
      cell: (row) => (
        <TwoLine
          primary={<span className="batch-cell__date">PU {formatDateTimeCompact(row.pickUpDate)}</span>}
          secondary={<span className="batch-cell__date">DL {formatDateTimeCompact(row.deliveryDate)}</span>}
        />
      ),
    },
    {
      key: 'route',
      header: 'Route',
      thClassName: 'col-route',
      cell: (row) => (
        <TwoLine
          primary={
            <span className="batch-route" title={`${row.pickupLocation} → ${row.deliveryLocation}`}>
              <span>{row.pickupCity}</span>
              <span className="batch-route__arrow">→</span>
              <span>{row.deliveryCity}</span>
            </span>
          }
          secondary={
            <span title={`${row.pickupLocation} · ${row.deliveryLocation}`}>
              {truncateLoc(row.pickupLocation, 18)} → {truncateLoc(row.deliveryLocation, 18)}
            </span>
          }
        />
      ),
    },
    {
      key: 'invoiceAmount',
      header: 'Amount',
      align: 'right',
      thClassName: 'col-amount',
      filter: { type: 'range' },
      cell: (row) => (
        <TwoLine
          align="right"
          primary={<span className="batch-amount">{formatCurrency(row.invoiceAmount, row.currency)}</span>}
          secondary={row.invoiceAvgCount}
        />
      ),
    },
    {
      key: 'meta',
      header: 'Details',
      thClassName: 'col-meta',
      hideBelow: 'lg',
      cell: (row) => (
        <TwoLine
          primary={row.reasonCode || (row.audited ? 'Audited' : '—')}
          secondary={row.draftInvoice ? `Draft ${row.draftInvoiceNo ?? ''}` : formatDateTimeCompact(row.orderDate)}
        />
      ),
    },
    {
      key: 'stage',
      header: 'Stage',
      thClassName: 'col-stage',
      cell: (row) => <CurrentStagePill order={row} />,
    },
  ]
}
