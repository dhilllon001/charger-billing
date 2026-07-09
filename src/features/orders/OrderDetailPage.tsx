import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Copy, Plus, Trash2, FileText, Folder,
  ZoomIn, ZoomOut, RotateCw, Maximize2, MapPin, Phone, Mail, User,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { WorkflowStageCompact } from '@/components/ui/WorkflowStepper'
import { getOrderById } from '@/data/mock-orders'
import { getOrderAdjuster, getOrderAuditLog } from '@/data/mock-order-detail'
import {
  getRelatedPOs,
  getInvoiceHistory,
  getAccountingSync,
  getInternalRatings,
} from '@/data/mock-order-extended'
import { formatCurrency, formatDate } from '@/lib/format'
import { useUiStore } from '@/stores/ui-store'
import { cn } from '@/lib/cn'
import type { Order, OrderDocument, OrderAdjuster, AuditEntry, OrderWorkflow } from '@/data/models'

const leftTabs = ['Charges', 'Internal Ratings', 'Related PO', 'Invoice History', 'Accounting Sync', 'Notes', 'Instructions'] as const
const rightTabs = ['Account', 'Billing', 'Audit', 'Documents'] as const

export function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const addToast = useUiStore((s) => s.addToast)
  const order = getOrderById(orderId ?? '')
  const claimsContact = getOrderAdjuster(orderId ?? '')
  const auditLog = getOrderAuditLog(orderId ?? '')

  const [leftTab, setLeftTab] = useState<(typeof leftTabs)[number]>('Charges')
  const [rightTab, setRightTab] = useState<(typeof rightTabs)[number]>('Billing')
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null)

  const relatedPOs = getRelatedPOs(orderId ?? '')
  const invoiceHistory = getInvoiceHistory(orderId ?? '')
  const accountingSync = getAccountingSync(orderId ?? '')
  const internalRatings = getInternalRatings(orderId ?? '')

  const charges = order?.charges ?? []
  const totals = useMemo(() => {
    const base = charges.filter((c) => c.item !== 'AUTO-FSC' && c.item !== 'FSC').reduce((s, c) => s + c.total, 0)
    const fsc = charges.filter((c) => c.item === 'AUTO-FSC' || c.item === 'FSC').reduce((s, c) => s + c.total, 0)
    const sub = base + fsc
    const tax = charges.reduce((s, c) => s + (c.taxCode === 'G' ? c.total * 0.05 : 0), 0)
    return { base, fsc, sub, tax, total: sub + tax }
  }, [charges])

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <p className="text-[15px] font-semibold">Order not found</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate('/batch-invoicing')}>
          <ArrowLeft size={14} strokeWidth={1.7} /> Back to Batch Invoicing
        </Button>
      </div>
    )
  }

  const pickup = order.pickup ?? {
    label: 'Pickup',
    facility: order.pickupLocation,
    address: order.pickupLocation,
    city: order.pickupCity,
    state: order.pickupState,
    zip: '',
    schedule: formatDate(order.pickUpDate),
  }
  const delivery = order.delivery ?? {
    label: 'Delivery',
    facility: order.deliveryLocation,
    address: order.deliveryLocation,
    city: order.deliveryCity,
    state: order.deliveryState,
    zip: '',
    schedule: formatDate(order.deliveryDate),
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="od-page">
      <header className="od-header od-header--compact">
        <div className="od-header__row">
          <button type="button" onClick={() => navigate(-1)} className="od-back">
            <ArrowLeft size={14} strokeWidth={2} />
          </button>
          <div className="od-header__ids">
            <span className="od-header__order">{order.orderNo}</span>
            {order.probillId && <span className="od-header__probill">{order.probillId}</span>}
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(order.orderNo)
                addToast('Order # copied')
              }}
              className="od-header__copy"
            >
              <Copy size={13} strokeWidth={1.7} />
            </button>
          </div>
          <div className="od-actions od-actions--compact">
            <Button variant="ghost" size="sm">Auto Rate</Button>
            <Button variant="ghost" size="sm">Audit</Button>
            <Button variant="ghost" size="sm">A &amp; I</Button>
            <Button variant="primary" size="sm">Generate Invoice</Button>
          </div>
        </div>

        <div className="od-top-strip">
          <div className="od-top-strip__meta">
            <span className="od-top-strip__customer">{order.customer}</span>
            <span className="od-top-strip__dot">·</span>
            <span>PO {order.poNo}</span>
            <span className="od-top-strip__dot">·</span>
            <span>{formatDate(order.orderDate)}</span>
          </div>
          <div className="od-stops-row">
            <CompactStop type="pickup" stop={pickup} onView={() => addToast('Opening pickup details…')} />
            <CompactStop type="delivery" stop={delivery} onView={() => addToast('Opening delivery details…')} />
          </div>
        </div>

        {order.workflow && (
          <div className="od-stage-inline">
            <WorkflowStageCompact workflow={order.workflow} />
          </div>
        )}

        {order.workflow && <ValidationCards workflow={order.workflow} />}
      </header>

      <div className="od-dual">
        {/* Left — billing workspace */}
        <div className="od-panel od-panel--left">
          <div className="od-tabs od-tabs--apple">
            {leftTabs.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setLeftTab(t)}
                className={cn('od-tabs__btn', leftTab === t && 'is-active')}
              >
                {t}{(t === 'Notes' || t === 'Instructions') && ' (0)'}
              </button>
            ))}
            {leftTab === 'Charges' && (
              <Button size="sm" variant="ghost" className="!ml-auto !mr-2 !h-7 shrink-0">
                <Plus size={14} strokeWidth={1.7} /> Add
              </Button>
            )}
          </div>

          <div className="od-panel__body">
            {leftTab === 'Charges' && (
              <>
                <div className="od-panel__body--flush -mx-3.5 sm:-mx-4 od-table-scroll">
                  <table className="od-charges-clean od-charges-clean--full">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Description</th>
                        <th className="num">Price</th>
                        <th className="num">Qty</th>
                        <th>Tax Code</th>
                        <th className="num">Total Charges</th>
                        <th>Created On</th>
                        <th>Created By</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {charges.map((c, i) => (
                        <tr key={i} className="od-charges-clean__row">
                          <td className="item">{c.item}</td>
                          <td className="desc">{c.description}</td>
                          <td className="num">{formatCurrency(c.price, order.currency)}</td>
                          <td className="num">{c.qty}</td>
                          <td>{c.taxCode ?? '—'}</td>
                          <td className="num">{formatCurrency(c.total, order.currency)}</td>
                          <td className="meta">{formatDate(c.createdOn)}</td>
                          <td className="meta">{c.createdBy.split('@')[0]}</td>
                          <td className="act">
                            <button type="button" className="od-charge-del" title="Remove charge">
                              <Trash2 size={13} strokeWidth={1.7} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="od-summary od-summary--full od-summary--inset">
                  <span>Base Charges <strong>{formatCurrency(totals.base, order.currency)}</strong></span>
                  <span>FSC Amount <strong>{formatCurrency(totals.fsc, order.currency)}</strong></span>
                  <span>Sub Total <strong>{formatCurrency(totals.sub, order.currency)}</strong></span>
                  <span>Tax Amount <strong>{formatCurrency(totals.tax, order.currency)}</strong></span>
                  <span className="od-summary__total">Total <strong>{formatCurrency(totals.total || order.invoiceAmount, order.currency)}</strong></span>
                </div>
              </>
            )}
            {leftTab === 'Internal Ratings' && <InternalRatingsTable ratings={internalRatings} />}
            {leftTab === 'Related PO' && <RelatedPOTable rows={relatedPOs} />}
            {leftTab === 'Invoice History' && <InvoiceHistoryTable rows={invoiceHistory} />}
            {leftTab === 'Accounting Sync' && <AccountingSyncTable rows={accountingSync} />}
            {leftTab === 'Notes' && <EmptyPanel title="No notes" hint="Add notes for this order." actionLabel="Add note" />}
            {leftTab === 'Instructions' && (
              <EmptyPanel
                title={order.instruction ? 'Instructions' : 'No instructions'}
                hint={order.instruction ?? 'Special handling instructions appear here.'}
              />
            )}
          </div>
        </div>

        {/* Right — account / billing / audit / docs */}
        <div className="od-panel od-panel--right">
          <div className="od-tabs od-tabs--apple">
            {rightTabs.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setRightTab(t)}
                className={cn('od-tabs__btn', rightTab === t && 'is-active')}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="od-panel__body">
            {rightTab === 'Account' && <AccountPanel order={order} />}
            {rightTab === 'Billing' && (
              <BillingPanel order={order} claimsContact={claimsContact} totals={totals} />
            )}
            {rightTab === 'Audit' && <AuditPanel entries={auditLog} />}
            {rightTab === 'Documents' && (
              <DocumentsPanel
                documents={order.documents ?? []}
                selectedDoc={selectedDoc}
                onSelect={setSelectedDoc}
              />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function CompactStop({
  type,
  stop,
  onView,
}: {
  type: 'pickup' | 'delivery'
  stop: NonNullable<Order['pickup']>
  onView: () => void
}) {
  return (
    <div className={cn('od-compact-stop od-hover-card', type === 'delivery' && 'od-compact-stop--delivery')}>
      <div className="od-compact-stop__head">
        <span className="od-compact-stop__label">{type === 'pickup' ? 'Shipper · Pickup' : 'Consignee · Delivery'}</span>
        <Button variant="ghost" size="sm" className="!h-6 !px-2 !text-[10px]" onClick={onView}>
          <MapPin size={11} strokeWidth={2} /> View
        </Button>
      </div>
      <p className="od-compact-stop__name">{stop.facility}</p>
      <p className="od-compact-stop__addr">{stop.city}, {stop.state} {stop.zip}</p>
      <p className="od-compact-stop__time">{stop.actual || stop.schedule}</p>
    </div>
  )
}

function AccountPanel({ order }: { order: Order }) {
  const fields = [
    { label: 'Customer', value: order.customer },
    { label: 'Bill To', value: order.billToCustomer },
    { label: 'Bill To Address', value: order.billToAddress },
    { label: 'Division', value: order.division },
    { label: 'Equipment', value: order.equipment },
    { label: 'Trailer', value: order.trailerNo },
    { label: 'Distance', value: order.distance },
    { label: 'Lane', value: order.lane },
    { label: 'Dispatcher', value: order.dispatcher },
    { label: "Caller's Name", value: order.callerName },
    { label: 'Sales Rep', value: order.salesRep },
    { label: 'Instruction', value: order.instruction },
  ]

  return (
    <dl className="od-detail-list">
      {fields.filter((f) => f.value).map((f) => (
        <div key={f.label} className="od-detail-item od-hover-card">
          <dt>{f.label}</dt>
          <dd>{f.value}</dd>
        </div>
      ))}
    </dl>
  )
}

function BillingPanel({
  order,
  claimsContact,
  totals,
}: {
  order: Order
  claimsContact: OrderAdjuster
  totals: { sub: number; total: number }
}) {
  return (
    <div className="od-billing-panel">
      <div className="od-billing-kpis">
        <div className="od-billing-kpi od-hover-card">
          <dt>Invoice Status</dt>
          <dd>{order.invoiceStatus}</dd>
        </div>
        <div className="od-billing-kpi od-hover-card">
          <dt>PO Billing</dt>
          <dd>{order.poBillingStatus}</dd>
        </div>
        <div className="od-billing-kpi od-hover-card">
          <dt>Invoice Amount</dt>
          <dd className="od-billing-kpi__amt">{formatCurrency(order.invoiceAmount, order.currency)}</dd>
        </div>
        <div className="od-billing-kpi od-hover-card">
          <dt>Charge Total</dt>
          <dd className="od-billing-kpi__amt">{formatCurrency(totals.total, order.currency)}</dd>
        </div>
      </div>

      <dl className="od-detail-list">
        {[
          { label: 'Currency', value: order.currency ?? 'CAD' },
          { label: 'Pick Up Date', value: formatDate(order.pickUpDate) },
          { label: 'Delivery Date', value: formatDate(order.deliveryDate) },
          { label: 'Late Invoice Reason', value: order.reasonForLateInvoice ?? 'None' },
          { label: 'Draft Invoice', value: order.draftInvoice ? order.draftInvoiceNo ?? 'Yes' : 'No' },
          { label: 'Audited', value: order.audited ? 'Yes' : 'No' },
        ]
          .filter((f) => f.value)
          .map((f) => (
            <div key={f.label} className="od-detail-item od-hover-card">
              <dt>{f.label}</dt>
              <dd>{f.value}</dd>
            </div>
          ))}
      </dl>

      <ClaimsContactCard contact={claimsContact} />
    </div>
  )
}

function ClaimsContactCard({ contact }: { contact: OrderAdjuster }) {
  return (
    <div className="od-claims-card od-hover-card">
      <div className="od-claims-card__head">
        <div className="od-claims-card__icon">
          <User size={16} strokeWidth={1.7} />
        </div>
        <div>
          <p className="od-claims-card__title">Claims &amp; billing contact</p>
          <p className="od-claims-card__hint">Your point of contact for charge disputes and adjustments on this load.</p>
        </div>
      </div>
      <p className="od-claims-card__name">{contact.name}</p>
      <p className="od-claims-card__region">{contact.region}</p>
      <div className="od-claims-card__links">
        <a href={`tel:${contact.phone}`} className="od-claims-card__link">
          <Phone size={12} strokeWidth={1.7} /> {contact.phone}
        </a>
        <a href={`mailto:${contact.email}`} className="od-claims-card__link">
          <Mail size={12} strokeWidth={1.7} /> {contact.email}
        </a>
      </div>
      <div className="od-claims-card__footer">
        <span>Open claims: <strong>{contact.openClaims}</strong></span>
        {contact.lastContact && <span>Last contact: {contact.lastContact}</span>}
      </div>
    </div>
  )
}

function AuditPanel({ entries }: { entries: AuditEntry[] }) {
  return (
    <ul className="od-audit-list">
      {entries.map((e) => (
        <li key={e.id} className={cn('od-audit-item od-hover-card', e.status && `od-audit-item--${e.status}`)}>
          <div className="od-audit-item__head">
            <span className="od-audit-item__action">{e.action}</span>
            <span className="od-audit-item__time">{e.timestamp}</span>
          </div>
          {e.detail && <p className="od-audit-item__detail">{e.detail}</p>}
          <p className="od-audit-item__user">{e.user}</p>
        </li>
      ))}
    </ul>
  )
}

function DocumentsPanel({
  documents,
  selectedDoc,
  onSelect,
}: {
  documents: OrderDocument[]
  selectedDoc: string | null
  onSelect: (name: string) => void
}) {
  const active = selectedDoc ?? documents[0]?.files[0]?.name

  return (
    <div className="flex flex-col gap-3">
      {documents.map((folder) => (
        <div key={folder.category}>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--sr-text-meta)]">
            <Folder size={13} strokeWidth={1.7} />
            {folder.category}
          </div>
          <div className="mt-1 space-y-0.5">
            {folder.files.map((f) => (
              <button
                key={f.name}
                type="button"
                onClick={() => onSelect(f.name)}
                className={cn(
                  'od-doc-item od-hover-card flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[11px]',
                  active === f.name ? 'is-active' : ''
                )}
              >
                <FileText size={13} strokeWidth={1.7} />
                <span className="truncate">{f.name}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
      <Card className="!rounded-xl !border-[var(--sr-border-1)] !shadow-none">
        <div className="flex items-center gap-1 border-b border-[var(--sr-border-1)] bg-[var(--sr-surface-2)] px-2 py-1">
          {[ZoomOut, ZoomIn, RotateCw, Maximize2].map((Icon, i) => (
            <button key={i} type="button" className="rounded-md p-1.5 text-[var(--sr-text-meta)] transition-colors hover:bg-white">
              <Icon size={12} strokeWidth={1.7} />
            </button>
          ))}
        </div>
        <div className="flex min-h-[140px] flex-col items-center justify-center p-4 text-center text-[11px] text-[var(--sr-text-meta)]">
          <FileText size={28} strokeWidth={1.5} className="mb-1 opacity-40" />
          {active ?? 'Select a document'}
        </div>
      </Card>
    </div>
  )
}

function ValidationCards({ workflow }: { workflow: OrderWorkflow }) {
  const cards = [
    { key: 'rate', label: 'Rate Validation', data: workflow.rateValidation, showCount: true },
    { key: 'ops', label: 'Operation Validation', data: workflow.operationValidation, showCount: true },
    { key: 'pod', label: 'POD Pending', data: workflow.podPending, showCount: true },
    { key: 'auto', label: 'Auto Invoicing', data: workflow.autoInvoicing, showCount: false },
    { key: 'delivery', label: 'Invoice Delivery', data: workflow.invoiceDelivery, showCount: false },
    { key: 'sync', label: 'Accounting Sync', data: workflow.accountingSync, showCount: false },
  ] as const

  return (
    <div className="od-validation-cards">
      {cards.map((c) => (
        <div key={c.key} className={cn('od-validation-card od-hover-card', `od-validation-card--${c.data.status}`)}>
          <span className="od-validation-card__label">{c.label}</span>
          {c.showCount ? (
            <span className="od-validation-card__count">
              <span className={c.data.status === 'passed' ? 'is-pass' : c.data.status === 'failed' ? 'is-fail' : ''}>
                {c.data.checksPassed}
              </span>
              /{c.data.checksTotal}
            </span>
          ) : (
            <span className="od-validation-card__status">{'label' in c.data ? c.data.label : '—'}</span>
          )}
        </div>
      ))}
    </div>
  )
}

function InternalRatingsTable({ ratings }: { ratings: ReturnType<typeof getInternalRatings> }) {
  return (
    <div className="od-table-scroll">
      <table className="od-charges-clean od-charges-clean--full">
        <thead>
          <tr><th>Carrier</th><th className="num">Lane Score</th><th className="num">On-Time %</th><th>Last Rated</th></tr>
        </thead>
        <tbody>
          {ratings.map((r, i) => (
            <tr key={i} className="od-charges-clean__row">
              <td className="item">{r.carrier}</td>
              <td className="num">{r.laneScore.toFixed(1)}</td>
              <td className="num">{r.onTimePct}%</td>
              <td>{r.lastRated}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function RelatedPOTable({ rows }: { rows: ReturnType<typeof getRelatedPOs> }) {
  return (
    <div className="od-table-scroll">
      <table className="od-charges-clean od-charges-clean--full">
        <thead>
          <tr>
            <th>Order No.</th><th>PO Category</th><th>Billing Status</th><th>PO Status</th>
            <th>Customer PO No.</th><th>PO Number</th><th>Order Status</th><th>Invoice No.</th><th className="num">Invoice Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="od-charges-clean__row">
              <td className="item">{r.orderNo}</td>
              <td>{r.poCategory}</td>
              <td>{r.billingStatus}</td>
              <td>{r.poStatus}</td>
              <td>{r.customerPoNo}</td>
              <td>{r.poNumber}</td>
              <td>{r.orderStatus}</td>
              <td>{r.invoiceNo ?? '—'}</td>
              <td className="num">{r.invoiceTotal != null ? formatCurrency(r.invoiceTotal) : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function InvoiceHistoryTable({ rows }: { rows: ReturnType<typeof getInvoiceHistory> }) {
  if (!rows.length) return <EmptyPanel title="No invoice history" hint="Invoices generated for this order will appear here." />
  return (
    <div className="od-table-scroll">
      <table className="od-charges-clean od-charges-clean--full">
        <thead>
          <tr><th>Invoice No.</th><th>Invoice Type</th><th>Invoice Status</th><th>Reason</th><th>Last Updated By</th><th>Last Updated On</th></tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="od-charges-clean__row">
              <td className="item">{r.invoiceNo}</td>
              <td>{r.invoiceType}</td>
              <td>{r.invoiceStatus}</td>
              <td>{r.reason ?? '—'}</td>
              <td>{r.lastUpdatedBy}</td>
              <td>{r.lastUpdatedOn}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function AccountingSyncTable({ rows }: { rows: ReturnType<typeof getAccountingSync> }) {
  if (!rows.length) return <EmptyPanel title="Not synced yet" hint="Accounting sync records appear after invoice export." />
  return (
    <div className="od-table-scroll">
      <table className="od-charges-clean od-charges-clean--full">
        <thead>
          <tr>
            <th>Invoice No.</th><th className="num">T.Amount</th><th>Invoice Date</th><th>P.Status</th>
            <th className="num">Amount Due</th><th>PO Number</th><th>From On Ac.</th><th className="num">Tax Amount</th>
            <th className="num">D.Amount</th><th>Currency</th><th>Invoice Due</th><th>Created By</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="od-charges-clean__row">
              <td className="item">{r.invoiceNo}</td>
              <td className="num">{formatCurrency(r.totalAmount, r.currency as 'USD')}</td>
              <td>{r.invoiceDate}</td>
              <td>{r.paymentStatus}</td>
              <td className="num">{formatCurrency(r.amountDue, r.currency as 'USD')}</td>
              <td>{r.poNumber}</td>
              <td>{r.fromOnAc ?? '—'}</td>
              <td className="num">{formatCurrency(r.taxAmount, r.currency as 'USD')}</td>
              <td className="num">{formatCurrency(r.dueAmount, r.currency as 'USD')}</td>
              <td>{r.currency}</td>
              <td>{r.invoiceDue}</td>
              <td>{r.createdBy}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


function EmptyPanel({ title, hint, actionLabel }: { title: string; hint: string; actionLabel?: string }) {
  return (
    <div className="py-12 text-center">
      <p className="text-[14px] font-semibold">{title}</p>
      <p className="mt-1 text-[12px] text-[var(--sr-text-meta)]">{hint}</p>
      {actionLabel && <Button variant="ghost" size="sm" className="mt-4">{actionLabel}</Button>}
    </div>
  )
}
