import { useState, useMemo, useEffect } from 'react'
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
import { formatCurrency, formatDate } from '@/lib/format'
import { useUiStore } from '@/stores/ui-store'
import { cn } from '@/lib/cn'
import type { Order, OrderDocument, OrderAdjuster, AuditEntry } from '@/data/models'

const leftTabs = ['Charges', 'Internal Ratings', 'Related PO', 'Notes', 'Instructions'] as const
const rightTabs = ['Account', 'Audit', 'Documents'] as const

export function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const addToast = useUiStore((s) => s.addToast)
  const setSidebarCollapsed = useUiStore((s) => s.setSidebarCollapsed)
  const order = getOrderById(orderId ?? '')
  const adjuster = getOrderAdjuster(orderId ?? '')
  const auditLog = getOrderAuditLog(orderId ?? '')

  const [leftTab, setLeftTab] = useState<(typeof leftTabs)[number]>('Charges')
  const [rightTab, setRightTab] = useState<(typeof rightTabs)[number]>('Audit')
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null)

  useEffect(() => {
    setSidebarCollapsed(true)
  }, [setSidebarCollapsed])

  const charges = order?.charges ?? []
  const totals = useMemo(() => {
    const base = charges.filter((c) => c.item !== 'AUTO-FSC' && c.item !== 'FSC').reduce((s, c) => s + c.total, 0)
    const fsc = charges.filter((c) => c.item === 'AUTO-FSC' || c.item === 'FSC').reduce((s, c) => s + c.total, 0)
    const sub = base + fsc
    return { base, fsc, sub, tax: 0, total: sub }
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
      </header>

      <div className="od-triple">
        {/* Left — charges */}
        <div className="od-panel od-panel--left">
          <div className="od-panel__head">
            <span className="od-panel__title">Charges</span>
            <Button size="sm" variant="ghost" className="!h-7">
              <Plus size={14} strokeWidth={1.7} /> Add
            </Button>
          </div>
          <div className="od-panel__body od-panel__body--flush">
            <table className="od-charges-clean">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Description</th>
                  <th className="num">Qty</th>
                  <th className="num">Total</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {charges.map((c, i) => (
                  <tr key={i}>
                    <td className="item">{c.item}</td>
                    <td className="desc">{c.description}</td>
                    <td className="num">{c.qty}</td>
                    <td className="num">{formatCurrency(c.total, order.currency)}</td>
                    <td className="act">
                      <button type="button" className="od-charge-del">
                        <Trash2 size={13} strokeWidth={1.7} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="od-summary od-summary--compact">
            <span>Subtotal <strong>{formatCurrency(totals.sub, order.currency)}</strong></span>
            <span className="od-summary__total">{formatCurrency(totals.total || order.invoiceAmount, order.currency)}</span>
          </div>
          <div className="od-left-tabs">
            {leftTabs.filter((t) => t !== 'Charges').map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setLeftTab(t)}
                className={cn('od-left-tabs__btn', leftTab === t && 'is-active')}
              >
                {t}{(t === 'Notes' || t === 'Instructions') && ' (0)'}
              </button>
            ))}
          </div>
          {leftTab !== 'Charges' && (
            <div className="od-panel__body od-panel__body--secondary">
              {leftTab === 'Internal Ratings' && <EmptyPanel title="Internal Ratings" hint="Rating details when configured." />}
              {leftTab === 'Related PO' && <RelatedPOTable order={order} />}
              {leftTab === 'Notes' && <EmptyPanel title="No notes" hint="Add notes for this order." />}
              {leftTab === 'Instructions' && <EmptyPanel title="No instructions" hint="Special handling instructions." />}
            </div>
          )}
        </div>

        {/* Center — adjuster */}
        <div className="od-panel od-panel--center">
          <div className="od-panel__head">
            <span className="od-panel__title">Adjuster</span>
            <span className={cn('od-adjuster-status', `od-adjuster-status--${adjuster.status.toLowerCase().replace(' ', '-')}`)}>
              {adjuster.status}
            </span>
          </div>
          <div className="od-panel__body">
            <AdjusterPanel adjuster={adjuster} />
          </div>
        </div>

        {/* Right — account / audit / docs */}
        <div className="od-panel od-panel--right">
          <div className="od-tabs">
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
    <div className={cn('od-compact-stop', type === 'delivery' && 'od-compact-stop--delivery')}>
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
    { label: 'Billing Status', value: order.poBillingStatus },
    { label: 'Currency', value: order.currency ?? 'CAD' },
    { label: 'Sales Rep', value: order.salesRep },
    { label: 'Invoice Status', value: order.invoiceStatus },
    { label: 'Invoice Amount', value: formatCurrency(order.invoiceAmount, order.currency) },
    { label: 'Pick Up', value: formatDate(order.pickUpDate) },
    { label: 'Delivery', value: formatDate(order.deliveryDate) },
    { label: 'Instruction', value: order.instruction },
  ]

  return (
    <dl className="od-detail-list">
      {fields.filter((f) => f.value).map((f) => (
        <div key={f.label} className="od-detail-item">
          <dt>{f.label}</dt>
          <dd>{f.value}</dd>
        </div>
      ))}
    </dl>
  )
}

function AdjusterPanel({ adjuster }: { adjuster: OrderAdjuster }) {
  return (
    <div className="od-adjuster">
      <div className="od-adjuster__card">
        <div className="od-adjuster__avatar">
          <User size={18} strokeWidth={1.7} />
        </div>
        <div>
          <p className="od-adjuster__name">{adjuster.name}</p>
          <p className="od-adjuster__region">{adjuster.region}</p>
        </div>
      </div>
      <div className="od-adjuster__contacts">
        <a href={`tel:${adjuster.phone}`} className="od-adjuster__link">
          <Phone size={13} strokeWidth={1.7} /> {adjuster.phone}
        </a>
        <a href={`mailto:${adjuster.email}`} className="od-adjuster__link">
          <Mail size={13} strokeWidth={1.7} /> {adjuster.email}
        </a>
      </div>
      {adjuster.lastContact && (
        <p className="od-adjuster__meta">Last contact · {adjuster.lastContact}</p>
      )}
      <p className="od-adjuster__meta">Open claims · <strong>{adjuster.openClaims}</strong></p>
      {adjuster.notes && <p className="od-adjuster__note">{adjuster.notes}</p>}
      {adjuster.adjustments && adjuster.adjustments.length > 0 && (
        <div className="od-adjuster__history">
          <p className="od-adjuster__history-title">Recent adjustments</p>
          {adjuster.adjustments.map((a, i) => (
            <div key={i} className="od-adjuster__history-row">
              <span className="od-adjuster__history-date">{a.date}</span>
              <span className="od-adjuster__history-type">{a.type}</span>
              <p className="od-adjuster__history-note">{a.note}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AuditPanel({ entries }: { entries: AuditEntry[] }) {
  return (
    <ul className="od-audit-list">
      {entries.map((e) => (
        <li key={e.id} className={cn('od-audit-item', e.status && `od-audit-item--${e.status}`)}>
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
                  'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[11px]',
                  active === f.name ? 'bg-[var(--accent-soft)] font-medium text-[var(--sr-action)]' : 'text-[var(--sr-text-secondary)] hover:bg-[var(--sr-surface-2)]'
                )}
              >
                <FileText size={13} strokeWidth={1.7} />
                <span className="truncate">{f.name}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
      <Card className="!rounded-lg !border-[var(--sr-border-1)]">
        <div className="flex items-center gap-1 border-b border-[var(--sr-border-1)] bg-[var(--sr-surface-2)] px-2 py-1">
          {[ZoomOut, ZoomIn, RotateCw, Maximize2].map((Icon, i) => (
            <button key={i} type="button" className="rounded p-1 text-[var(--sr-text-meta)]">
              <Icon size={12} strokeWidth={1.7} />
            </button>
          ))}
        </div>
        <div className="flex min-h-[120px] flex-col items-center justify-center p-4 text-center text-[11px] text-[var(--sr-text-meta)]">
          <FileText size={24} strokeWidth={1.5} className="mb-1 opacity-50" />
          {active ?? 'Select a document'}
        </div>
      </Card>
    </div>
  )
}

function RelatedPOTable({ order }: { order: Order }) {
  return (
    <table className="od-charges-clean">
      <tbody>
        <tr>
          <td className="item">{order.orderNo}</td>
          <td>{order.poCategory}</td>
          <td>{order.poBillingStatus}</td>
          <td>{order.poNo}</td>
        </tr>
      </tbody>
    </table>
  )
}

function EmptyPanel({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="py-8 text-center">
      <p className="text-[13px] font-semibold">{title}</p>
      <p className="mt-1 text-[11px] text-[var(--sr-text-meta)]">{hint}</p>
    </div>
  )
}
