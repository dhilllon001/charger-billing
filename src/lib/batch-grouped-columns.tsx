import { Plus, Tag } from 'lucide-react'
import type { Order } from '@/data/models'
import type { SrColumn } from '@/components/report/SrDataTable'
import { getCurrentWorkflowStage } from '@/components/ui/WorkflowStepper'
import { formatCurrency, formatDateTime } from '@/lib/format'
import { cn } from '@/lib/cn'

function TwoLine({ primary, secondary, primaryClassName }: { primary: React.ReactNode; secondary?: React.ReactNode; primaryClassName?: string }) {
  return (
    <div className="batch-cell">
      <div className={cn('batch-cell__primary', primaryClassName)}>{primary}</div>
      {secondary != null && secondary !== '' && <div className="batch-cell__secondary">{secondary}</div>}
    </div>
  )
}

function CountryFlag({ currency }: { currency?: string }) {
  const isUS = currency === 'USD'
  return (
    <span className={cn('batch-flag', isUS ? 'batch-flag--us' : 'batch-flag--ca')} title={isUS ? 'United States' : 'Canada'}>
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

export function buildBatchGroupedColumns(): SrColumn<Order>[] {
  return [
    {
      key: 'indicators',
      header: '',
      thClassName: 'col-indicators',
      cell: (row) => (
        <div className="batch-indicators">
          <button type="button" className="batch-indicators__btn" title="Expand row" onClick={(e) => e.stopPropagation()}>
            <Plus size={13} strokeWidth={2} />
          </button>
          <CountryFlag currency={row.currency} />
          <button type="button" className="batch-indicators__tag" title="Rates" onClick={(e) => e.stopPropagation()}>
            <Tag size={12} strokeWidth={2} />
          </button>
          {row.hasPod && <span className="batch-pod-badge">POD</span>}
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
          primary={<span className="truncate" title={row.customer}>{row.customer}</span>}
          secondary={<span className="truncate" title={row.billToCustomer}>Bill to · {row.billToCustomer}</span>}
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
          secondary={<span className="mono">PO {row.poNo}</span>}
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
          primary={<span className="truncate">{row.division}</span>}
          secondary={row.poCategory}
        />
      ),
    },
    {
      key: 'poBilling',
      header: 'Billing',
      thClassName: 'col-billing',
      hideBelow: 'md',
      cell: (row) => (
        <TwoLine primary={row.poCategory} secondary={row.poBillingStatus} />
      ),
    },
    {
      key: 'dates',
      header: 'Pick Up / Delivery',
      thClassName: 'col-dates',
      cell: (row) => (
        <TwoLine
          primary={formatDateTime(row.pickUpDate)}
          secondary={formatDateTime(row.deliveryDate)}
        />
      ),
    },
    {
      key: 'pickup',
      header: 'Pickup',
      thClassName: 'col-location',
      hideBelow: 'lg',
      cell: (row) => (
        <TwoLine
          primary={<span className="truncate" title={row.pickupLocation}>{row.pickupLocation}</span>}
          secondary={`${row.pickupCity} · ${row.pickupState}`}
        />
      ),
    },
    {
      key: 'delivery',
      header: 'Delivery',
      thClassName: 'col-location',
      hideBelow: 'lg',
      cell: (row) => (
        <TwoLine
          primary={<span className="truncate" title={row.deliveryLocation}>{row.deliveryLocation}</span>}
          secondary={`${row.deliveryCity} · ${row.deliveryState}`}
        />
      ),
    },
    {
      key: 'caller',
      header: "Caller's Name",
      thClassName: 'col-caller',
      hideBelow: 'lg',
      cell: (row) => (
        <TwoLine primary={row.callerName || '—'} secondary={row.equipment} />
      ),
    },
    {
      key: 'invoiceAmount',
      header: 'I.Amt',
      align: 'right',
      thClassName: 'col-amount',
      filter: { type: 'range' },
      cell: (row) => (
        <TwoLine
          primary={<span className="batch-amount">{formatCurrency(row.invoiceAmount, row.currency)}</span>}
          secondary={row.invoiceAvgCount}
          primaryClassName="!text-right"
        />
      ),
    },
    {
      key: 'reason',
      header: 'Reason / Audited',
      thClassName: 'col-reason',
      hideBelow: 'md',
      cell: (row) => (
        <TwoLine
          primary={row.reasonCode || '—'}
          secondary={row.audited ? 'Audited' : 'Not audited'}
        />
      ),
    },
    {
      key: 'draft',
      header: 'Draft',
      thClassName: 'col-draft',
      hideBelow: 'lg',
      cell: (row) => (
        <TwoLine
          primary={row.draftInvoice ? 'Draft' : '—'}
          secondary={row.draftInvoiceNo ?? '—'}
        />
      ),
    },
    {
      key: 'stage',
      header: 'Stage',
      thClassName: 'col-stage',
      cell: (row) => <CurrentStagePill order={row} />,
    },
    {
      key: 'orderDate',
      header: 'Order / Due',
      thClassName: 'col-order-date',
      hideBelow: 'md',
      cell: (row) => (
        <TwoLine
          primary={formatDateTime(row.orderDate)}
          secondary={row.invoiceDue ? formatDateTime(row.invoiceDue) : '—'}
        />
      ),
    },
  ]
}
