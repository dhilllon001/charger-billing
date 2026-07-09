import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Copy, Plus, Trash2, FileText, Folder,
  ZoomIn, ZoomOut, RotateCw, Maximize2, MapPin, Phone, Mail, User, Sparkles,
  PanelLeftClose, PanelLeftOpen, Star, Link2, History, RefreshCw, StickyNote, ClipboardList,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ResizableSplit } from '@/components/orders/ResizableSplit'
import { WorkflowStageSteps } from '@/components/ui/WorkflowStepper'
import { getOrderById } from '@/data/mock-orders'
import { getOrderAdjuster, getOrderAuditLog } from '@/data/mock-order-detail'
import {
  getRelatedPOs,
  getInvoiceHistory,
  getAccountingSync,
  getInternalRatings,
  getOrderNotes,
  getOrderInstructions,
} from '@/data/mock-order-extended'
import { formatCurrency, formatDate } from '@/lib/format'
import { useUiStore } from '@/stores/ui-store'
import { cn } from '@/lib/cn'
import type { Order, OrderDocument, OrderAdjuster, AuditEntry } from '@/data/models'

const leftTabs = ['Charges', 'Internal Ratings', 'Related PO', 'Invoice History', 'Accounting Sync'] as const
const rightTabs = ['A.I.', 'Account', 'Billing', 'Audit', 'Documents', 'Notes', 'Instructions'] as const

export function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const addToast = useUiStore((s) => s.addToast)
  const order = getOrderById(orderId ?? '')
  const claimsContact = getOrderAdjuster(orderId ?? '')
  const auditLog = getOrderAuditLog(orderId ?? '')

  const [leftTab, setLeftTab] = useState<(typeof leftTabs)[number]>('Charges')
  const [rightTab, setRightTab] = useState<(typeof rightTabs)[number]>('A.I.')
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null)
  const [railCollapsed, setRailCollapsed] = useState(false)

  const relatedPOs = getRelatedPOs(orderId ?? '')
  const invoiceHistory = getInvoiceHistory(orderId ?? '')
  const accountingSync = getAccountingSync(orderId ?? '')
  const internalRatings = getInternalRatings(orderId ?? '')
  const orderNotes = getOrderNotes(orderId ?? '')
  const orderInstructions = getOrderInstructions(orderId ?? '')

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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="od-page od-page--apple">
      <header className="od-strip-header">
        <div className="od-strip-header__row">
          <button type="button" onClick={() => navigate(-1)} className="od-back" aria-label="Back">
            <ArrowLeft size={15} strokeWidth={2} />
          </button>
          <span className="od-strip-header__order">{order.orderNo}</span>
          {order.probillId && <span className="od-strip-header__probill">{order.probillId}</span>}
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(order.orderNo)
              addToast('Order # copied')
            }}
            className="od-strip-header__copy"
            aria-label="Copy order number"
          >
            <Copy size={13} strokeWidth={1.7} />
          </button>
          <span className="od-strip-header__divider" aria-hidden />
          <span className="od-strip-header__customer">{order.customer}</span>
          <span className="od-strip-header__sep">·</span>
          <span className="od-strip-header__meta">PO {order.poNo}</span>
          <span className="od-strip-header__sep">·</span>
          <span className="od-strip-header__meta">{formatDate(order.orderDate)}</span>
          <div className="od-strip-header__actions">
            <Button variant="ghost" size="sm" className="od-btn-pill">Auto Rate</Button>
            <Button variant="ghost" size="sm" className="od-btn-pill">Audit</Button>
            <Button variant="primary" size="sm" className="od-btn-generate">
              <FileText size={14} strokeWidth={2} />
              Generate Invoice
            </Button>
          </div>
        </div>
      </header>

      <div className="od-page__inner">
        <div className="od-stack">
          {order.workflow && (
            <section className="od-page__section">
              <WorkflowStageSteps workflow={order.workflow} />
            </section>
          )}

          <section className="od-page__section">
            <div className="od-stops-grid">
              <CompactStop type="pickup" stop={pickup} onView={() => addToast('Opening pickup details…')} />
              <CompactStop type="delivery" stop={delivery} onView={() => addToast('Opening delivery details…')} />
            </div>
          </section>

          <section className="od-page__section od-page__section--grow">
          <ResizableSplit
          className="od-splitter--panels"
          defaultRatio={62}
          left={
            <div className={cn('od-left-workspace', railCollapsed && 'od-left-workspace--rail-collapsed')}>
              {!railCollapsed && (
                <OrderDetailRail
                  order={order}
                  totals={totals}
                  onCollapse={() => setRailCollapsed(true)}
                />
              )}
              {railCollapsed && (
                <button
                  type="button"
                  className="od-order-rail-fab"
                  onClick={() => setRailCollapsed(false)}
                  aria-label="Order detail"
                  title="Order detail"
                >
                  <PanelLeftOpen size={15} strokeWidth={2} aria-hidden />
                  <span className="od-order-rail-fab__label">Order detail</span>
                </button>
              )}
              <div className="od-panel-card od-panel-card--left">
              <div className="od-tabs od-tabs--card">
                {leftTabs.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setLeftTab(t)}
                    className={cn('od-tabs__btn', leftTab === t && 'is-active')}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className={cn('od-panel__body', `od-panel__body--${leftTabSlug(leftTab)}`)}>
                {leftTab === 'Charges' && (
                  <ChargesInvoicePanel
                    charges={charges}
                    order={order}
                    totals={totals}
                    onRemove={() => addToast('Charge removed')}
                    onAdd={() => addToast('Add charge dialog coming soon')}
                  />
                )}
                {leftTab === 'Internal Ratings' && <InternalRatingsPanel ratings={internalRatings} />}
                {leftTab === 'Related PO' && <RelatedPOPanel rows={relatedPOs} />}
                {leftTab === 'Invoice History' && <InvoiceHistoryPanel rows={invoiceHistory} />}
                {leftTab === 'Accounting Sync' && <AccountingSyncPanel rows={accountingSync} />}
              </div>
              </div>
            </div>
          }
          right={
            <div className="od-panel-card od-panel-card--right">
              <div className="od-tabs od-tabs--card">
                {rightTabs.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setRightTab(t)}
                    className={cn('od-tabs__btn', rightTab === t && 'is-active', t === 'A.I.' && 'od-tabs__btn--ai')}
                  >
                    {t === 'A.I.' ? (
                      <>
                        <Sparkles size={12} strokeWidth={2} />
                        A.I.
                      </>
                    ) : (
                      t
                    )}
                    {t === 'Notes' && ` (${orderNotes.length})`}
                    {t === 'Instructions' && ` (${orderInstructions.length})`}
                  </button>
                ))}
              </div>
              <div className={cn('od-panel__body', `od-panel__body--${rightTabSlug(rightTab)}`)}>
                {rightTab === 'A.I.' && <AIPanel order={order} />}
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
                {rightTab === 'Notes' && <NotesPanel notes={orderNotes} />}
                {rightTab === 'Instructions' && <InstructionsPanel instructions={orderInstructions} />}
              </div>
            </div>
          }
        />
          </section>
        </div>
      </div>
    </motion.div>
  )
}

function leftTabSlug(tab: (typeof leftTabs)[number]) {
  return tab.toLowerCase().replace(/\s+/g, '-')
}

function rightTabSlug(tab: (typeof rightTabs)[number]) {
  return tab.toLowerCase().replace(/\s+/g, '-').replace(/\./g, '')
}

function ChargesInvoicePanel({
  charges,
  order,
  totals,
  onRemove,
  onAdd,
}: {
  charges: NonNullable<Order['charges']>
  order: Order
  totals: { base: number; fsc: number; sub: number; tax: number; total: number }
  onRemove: () => void
  onAdd: () => void
}) {
  return (
    <div className="od-invoice">
      <div className="od-invoice__head">
        <div>
          <p className="od-invoice__label">Invoice preview</p>
          <p className="od-invoice__ref">{order.probillId ?? order.orderNo}</p>
        </div>
        <div className="od-invoice__head-actions">
          <div className="od-invoice__meta">
            <span>{order.currency ?? 'USD'}</span>
            <span className={cn('od-invoice__status', order.poBillingStatus === 'Hold' && 'is-hold')}>
              {order.poBillingStatus}
            </span>
          </div>
          <Button size="sm" variant="primary" className="od-invoice__add-btn" onClick={onAdd}>
            <Plus size={14} strokeWidth={2} /> Add charge
          </Button>
        </div>
      </div>

      <div className="od-invoice__table-wrap">
        <table className="od-invoice__table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Description</th>
              <th className="num">Qty</th>
              <th className="num">Rate</th>
              <th className="num">Amount</th>
              <th aria-hidden />
            </tr>
          </thead>
          <tbody>
            {charges.map((c, i) => (
              <tr key={i}>
                <td className="code">{c.item}</td>
                <td className="desc">
                  <span className="od-invoice__desc-main">{c.description}</span>
                  <span className="od-invoice__desc-sub">
                    {formatDate(c.createdOn)} · {c.createdBy.split('@')[0]}
                    {c.taxCode ? ` · Tax ${c.taxCode}` : ''}
                  </span>
                </td>
                <td className="num">{c.qty}</td>
                <td className="num">{formatCurrency(c.price, order.currency)}</td>
                <td className="num amount">{formatCurrency(c.total, order.currency)}</td>
                <td className="act">
                  <button type="button" className="od-invoice__remove" title="Remove charge" onClick={onRemove}>
                    <Trash2 size={12} strokeWidth={1.7} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="od-invoice__footer">
        <div className="od-invoice__totals">
          <div className="od-invoice__total-line">
            <span>Base charges</span>
            <span>{formatCurrency(totals.base, order.currency)}</span>
          </div>
          <div className="od-invoice__total-line">
            <span>FSC</span>
            <span>{formatCurrency(totals.fsc, order.currency)}</span>
          </div>
          <div className="od-invoice__total-line">
            <span>Subtotal</span>
            <span>{formatCurrency(totals.sub, order.currency)}</span>
          </div>
          <div className="od-invoice__total-line">
            <span>Tax</span>
            <span>{formatCurrency(totals.tax, order.currency)}</span>
          </div>
          <div className="od-invoice__total-line od-invoice__total-line--grand">
            <span>Total due</span>
            <span>{formatCurrency(totals.total || order.invoiceAmount, order.currency)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function NotesPanel({ notes }: { notes: ReturnType<typeof getOrderNotes> }) {
  return (
    <div className="od-section-panel od-section-panel--notes">
      <div className="od-section-panel__head">
        <StickyNote size={15} strokeWidth={2} />
        <div>
          <p className="od-section-panel__title">Notes</p>
          <p className="od-section-panel__sub">{notes.length} note{notes.length !== 1 ? 's' : ''} on this order</p>
        </div>
      </div>
      <ul className="od-notes-list">
        {notes.map((n) => (
          <li key={n.id} className="od-notes-item">
            <p className="od-notes-item__text">{n.text}</p>
            <p className="od-notes-item__meta">
              {n.createdBy} · {n.createdOn}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}

function InstructionsPanel({ instructions }: { instructions: ReturnType<typeof getOrderInstructions> }) {
  return (
    <div className="od-section-panel od-section-panel--instructions">
      <div className="od-section-panel__head">
        <ClipboardList size={15} strokeWidth={2} />
        <div>
          <p className="od-section-panel__title">Instructions</p>
          <p className="od-section-panel__sub">Handling and delivery requirements</p>
        </div>
      </div>
      <ul className="od-instructions-list">
        {instructions.map((ins) => (
          <li key={ins.id} className="od-instructions-item">
            <div className="od-instructions-item__head">
              <span className="od-instructions-item__type">{ins.type}</span>
              <span className="od-instructions-item__source">{ins.source}</span>
            </div>
            <p className="od-instructions-item__text">{ins.text}</p>
            <p className="od-instructions-item__meta">{ins.updatedOn}</p>
          </li>
        ))}
      </ul>
    </div>
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
  const location = [stop.city, stop.state, stop.zip].filter(Boolean).join(', ')
  const street =
    stop.address && stop.address !== stop.facility && !stop.address.includes(stop.city)
      ? stop.address
      : null
  const addressLine = [street, location].filter(Boolean).join(' · ')

  return (
    <div className={cn('od-stop-card', type === 'delivery' && 'od-stop-card--delivery')}>
      <div className="od-stop-card__head">
        <div className="od-stop-card__tags">
          <span className="od-stop-card__type">{type === 'pickup' ? 'Shipper' : 'Consignee'}</span>
          <span className="od-stop-card__badge">{type === 'pickup' ? 'Pickup' : 'Delivery'}</span>
        </div>
        <button type="button" className="od-stop-card__view" onClick={onView}>
          <MapPin size={11} strokeWidth={2} /> View
        </button>
      </div>
      <div className="od-stop-card__main">
        <div className="od-stop-card__info">
          <p className="od-stop-card__facility">{stop.facility}</p>
          {addressLine && <p className="od-stop-card__address">{addressLine}</p>}
          {stop.referenceNo && (
            <p className="od-stop-card__ref">
              <span>Ref</span> {stop.referenceNo}
            </p>
          )}
        </div>
        <div className="od-stop-card__times-inline">
          <div className="od-stop-card__time-col">
            <span className="od-stop-card__time-label">Scheduled</span>
            <span className="od-stop-card__time-value">{stop.schedule}</span>
          </div>
          {stop.actual && (
            <div className="od-stop-card__time-col od-stop-card__time-col--actual">
              <span className="od-stop-card__time-label">Actual</span>
              <span className="od-stop-card__time-value">{stop.actual}</span>
            </div>
          )}
        </div>
      </div>
      {stop.notes && (
        <p className="od-stop-card__notes">
          <span className="od-stop-card__notes-label">Note</span>
          {stop.notes}
        </p>
      )}
    </div>
  )
}

function OrderDetailRail({
  order,
  totals,
  onCollapse,
}: {
  order: Order
  totals: { total: number }
  onCollapse: () => void
}) {
  const groups = [
    {
      title: 'Order',
      shade: 'blue',
      items: [
        { label: 'Order #', value: order.orderNo },
        { label: 'PO #', value: order.poNo },
        { label: 'Customer', value: order.customer },
        { label: 'Bill To', value: order.billToCustomer },
      ],
    },
    {
      title: 'Load',
      shade: 'slate',
      items: [
        { label: 'Division', value: order.division },
        { label: 'Equipment', value: order.equipment },
        { label: 'Trailer', value: order.trailerNo },
        { label: 'Distance', value: order.distance },
        { label: 'Lane', value: order.lane },
        { label: 'Pick Up', value: formatDate(order.pickUpDate) },
        { label: 'Delivery', value: formatDate(order.deliveryDate) },
      ],
    },
    {
      title: 'Billing',
      shade: 'green',
      items: [
        { label: 'Invoice Status', value: order.invoiceStatus },
        { label: 'PO Billing', value: order.poBillingStatus },
        { label: 'Currency', value: order.currency ?? 'CAD' },
        { label: 'Charge Total', value: formatCurrency(totals.total, order.currency), highlight: true },
        { label: 'Sales Rep', value: order.salesRep },
        { label: 'Dispatcher', value: order.dispatcher?.split('@')[0] },
      ],
    },
  ]

  return (
    <aside className="od-order-rail" aria-label="Order details">
      <div className="od-order-rail__head">
        <div>
          <p className="od-order-rail__title">Order Detail</p>
          <p className="od-order-rail__subtitle">{order.orderNo}</p>
        </div>
        <button type="button" className="od-order-rail__collapse" onClick={onCollapse} aria-label="Collapse order detail">
          <PanelLeftClose size={15} strokeWidth={2} />
        </button>
      </div>
      <div className="od-order-rail__body">
        {groups.map((g) => (
          <section key={g.title} className={cn('od-order-rail__group', `od-order-rail__group--${g.shade}`)}>
            <h3 className="od-order-rail__group-title">{g.title}</h3>
            <dl className="od-order-rail__grid">
              {g.items.filter((r) => r.value).map((r) => (
                <div key={r.label} className="od-order-rail__cell">
                  <dt>{r.label}</dt>
                  <dd className={cn(r.highlight && 'is-highlight')}>{r.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
        {order.instruction && (
          <div className="od-order-rail__note">
            <span>Instruction</span>
            <p>{order.instruction}</p>
          </div>
        )}
      </div>
    </aside>
  )
}

function AIPanel({ order }: { order: Order }) {
  const insights = [
    {
      title: 'Rate validation',
      text: order.workflow?.rateValidation.status === 'warning'
        ? '1 check shows a warning — review lane rate vs. contracted tariff before invoicing.'
        : 'All rate checks passed for this order.',
      tone: order.workflow?.rateValidation.status === 'warning' ? 'warning' : 'positive',
    },
    {
      title: 'Billing readiness',
      text: `Charge total ${formatCurrency(order.invoiceAmount, order.currency)} · PO billing is ${order.poBillingStatus.toLowerCase()}.`,
      tone: 'neutral',
    },
    {
      title: 'Suggested action',
      text: order.poBillingStatus === 'Hold'
        ? 'Resolve PO hold before generating invoice — contact claims if adjustments are needed.'
        : 'Order is ready for auto-invoicing once validations complete.',
      tone: 'action',
    },
  ] as const

  return (
    <div className="od-ai-panel">
      <div className="od-ai-panel__hero">
        <div className="od-ai-panel__icon">
          <Sparkles size={18} strokeWidth={1.8} />
        </div>
        <div>
          <p className="od-ai-panel__title">Charger A.I.</p>
          <p className="od-ai-panel__subtitle">Insights for {order.orderNo}</p>
        </div>
      </div>
      <ul className="od-ai-panel__list">
        {insights.map((item) => (
          <li key={item.title} className={cn('od-ai-panel__item', `od-ai-panel__item--${item.tone}`)}>
            <p className="od-ai-panel__item-title">{item.title}</p>
            <p className="od-ai-panel__item-text">{item.text}</p>
          </li>
        ))}
      </ul>
      <div className="od-ai-panel__prompts">
        {['Explain rate warning', 'Draft invoice email', 'Compare to similar loads'].map((p) => (
          <button key={p} type="button" className="od-ai-panel__chip">{p}</button>
        ))}
      </div>
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

function InternalRatingsPanel({ ratings }: { ratings: ReturnType<typeof getInternalRatings> }) {
  return (
    <div className="od-section-panel od-section-panel--ratings">
      <div className="od-section-panel__head">
        <Star size={15} strokeWidth={2} />
        <div>
          <p className="od-section-panel__title">Internal Ratings</p>
          <p className="od-section-panel__sub">Carrier performance on this lane</p>
        </div>
      </div>
      <div className="od-rating-cards">
        {ratings.map((r, i) => (
          <div key={i} className="od-rating-card">
            <div className="od-rating-card__top">
              <span className="od-rating-card__carrier">{r.carrier}</span>
              <span className="od-rating-card__score">{r.laneScore.toFixed(1)}</span>
            </div>
            <div className="od-rating-card__bar-wrap">
              <div className="od-rating-card__bar" style={{ width: `${(r.laneScore / 5) * 100}%` }} />
            </div>
            <div className="od-rating-card__meta">
              <span>On-time {r.onTimePct}%</span>
              <span>{r.lastRated}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function RelatedPOPanel({ rows }: { rows: ReturnType<typeof getRelatedPOs> }) {
  return (
    <div className="od-section-panel od-section-panel--related-po">
      <div className="od-section-panel__head">
        <Link2 size={15} strokeWidth={2} />
        <div>
          <p className="od-section-panel__title">Related PO</p>
          <p className="od-section-panel__sub">{rows.length} linked purchase orders</p>
        </div>
      </div>
      <div className="od-data-cards">
        {rows.map((r) => (
          <article key={r.id} className="od-data-card">
            <div className="od-data-card__head">
              <span className="od-data-card__primary">{r.orderNo}</span>
              <span className={cn('od-pill', r.billingStatus === 'Hold' && 'od-pill--warn', r.billingStatus === 'Pending' && 'od-pill--info')}>
                {r.billingStatus}
              </span>
            </div>
            <dl className="od-data-card__grid">
              <div><dt>PO #</dt><dd>{r.poNumber}</dd></div>
              <div><dt>Category</dt><dd>{r.poCategory}</dd></div>
              <div><dt>PO Status</dt><dd>{r.poStatus}</dd></div>
              <div><dt>Order Status</dt><dd>{r.orderStatus}</dd></div>
              <div><dt>Invoice</dt><dd>{r.invoiceNo ?? '—'}</dd></div>
              <div><dt>Total</dt><dd>{r.invoiceTotal != null ? formatCurrency(r.invoiceTotal) : '—'}</dd></div>
            </dl>
          </article>
        ))}
      </div>
    </div>
  )
}

function InvoiceHistoryPanel({ rows }: { rows: ReturnType<typeof getInvoiceHistory> }) {
  return (
    <div className="od-section-panel od-section-panel--invoice-history">
      <div className="od-section-panel__head">
        <History size={15} strokeWidth={2} />
        <div>
          <p className="od-section-panel__title">Invoice History</p>
          <p className="od-section-panel__sub">Drafts and issued invoices</p>
        </div>
      </div>
      <div className="od-data-cards">
        {rows.map((r) => (
          <article key={r.id} className="od-data-card">
            <div className="od-data-card__head">
              <span className="od-data-card__primary">{r.invoiceNo}</span>
              <span className={cn(
                'od-pill',
                r.invoiceStatus === 'DRAFT' && 'od-pill--info',
                r.invoiceStatus === 'INVOICED' && 'od-pill--success',
                r.invoiceStatus === 'VOIDED' && 'od-pill--muted'
              )}>
                {r.invoiceStatus}
              </span>
            </div>
            <dl className="od-data-card__grid">
              <div><dt>Type</dt><dd>{r.invoiceType}</dd></div>
              <div><dt>Reason</dt><dd>{r.reason ?? '—'}</dd></div>
              <div><dt>Updated by</dt><dd>{r.lastUpdatedBy}</dd></div>
              <div><dt>Updated on</dt><dd>{r.lastUpdatedOn}</dd></div>
            </dl>
          </article>
        ))}
      </div>
    </div>
  )
}

function AccountingSyncPanel({ rows }: { rows: ReturnType<typeof getAccountingSync> }) {
  return (
    <div className="od-section-panel od-section-panel--accounting">
      <div className="od-section-panel__head">
        <RefreshCw size={15} strokeWidth={2} />
        <div>
          <p className="od-section-panel__title">Accounting Sync</p>
          <p className="od-section-panel__sub">ERP export and payment status</p>
        </div>
      </div>
      <div className="od-data-cards">
        {rows.map((r) => (
          <article key={r.id} className="od-data-card">
            <div className="od-data-card__head">
              <span className="od-data-card__primary">{r.invoiceNo}</span>
              <span className={cn(
                'od-pill',
                r.paymentStatus === 'Draft' && 'od-pill--info',
                r.paymentStatus === 'Open' && 'od-pill--warn',
                r.paymentStatus === 'Paid' && 'od-pill--success'
              )}>
                {r.paymentStatus}
              </span>
            </div>
            <dl className="od-data-card__grid od-data-card__grid--wide">
              <div><dt>Amount</dt><dd>{formatCurrency(r.totalAmount, r.currency as 'USD')}</dd></div>
              <div><dt>Due</dt><dd>{formatCurrency(r.amountDue, r.currency as 'USD')}</dd></div>
              <div><dt>Tax</dt><dd>{formatCurrency(r.taxAmount, r.currency as 'USD')}</dd></div>
              <div><dt>Invoice date</dt><dd>{r.invoiceDate}</dd></div>
              <div><dt>Invoice due</dt><dd>{r.invoiceDue}</dd></div>
              <div><dt>PO #</dt><dd>{r.poNumber}</dd></div>
              <div><dt>Currency</dt><dd>{r.currency}</dd></div>
              <div><dt>Created by</dt><dd>{r.createdBy}</dd></div>
            </dl>
          </article>
        ))}
      </div>
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
