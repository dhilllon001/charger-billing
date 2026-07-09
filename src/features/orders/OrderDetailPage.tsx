import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Copy, Plus, Trash2, FileText, Folder, ChevronRight,
  ZoomIn, ZoomOut, RotateCw, Maximize2,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { WorkflowStageCompact } from '@/components/ui/WorkflowStepper'
import { getOrderById } from '@/data/mock-orders'
import { formatCurrency, formatDate } from '@/lib/format'
import { useUiStore } from '@/stores/ui-store'
import { cn } from '@/lib/cn'
import type { Order, OrderDocument } from '@/data/models'

const leftTabs = ['Charges', 'Internal Ratings', 'Related PO', 'Notes', 'Instructions'] as const
const rightTabs = ['Order Details', 'Documents'] as const

export function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const addToast = useUiStore((s) => s.addToast)
  const order = getOrderById(orderId ?? '')

  const [leftTab, setLeftTab] = useState<(typeof leftTabs)[number]>('Charges')
  const [rightTab, setRightTab] = useState<(typeof rightTabs)[number]>('Order Details')
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null)

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
      {/* Header */}
      <header className="od-header">
        <div className="od-header__top">
          <button type="button" onClick={() => navigate(-1)} className="od-back">
            <ArrowLeft size={14} strokeWidth={2} /> Back
          </button>
          <div className="od-title-block">
            <h1 className="od-title">
              {order.orderNo}
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(order.orderNo)
                  addToast('Order # copied')
                }}
                className="rounded p-1 text-[var(--sr-text-meta)] hover:bg-[var(--sr-surface-2)]"
              >
                <Copy size={14} strokeWidth={1.7} />
              </button>
              {order.probillId && (
                <span className="rounded px-2 py-0.5 text-[11px] font-semibold" style={{ background: 'var(--sr-surface-2)', color: 'var(--sr-action)' }}>
                  {order.probillId}
                </span>
              )}
            </h1>
            <p className="od-subtitle">
              {order.customer} · PO {order.poNo} · {formatDate(order.orderDate)}
            </p>
          </div>
          <div className="od-actions">
            <Button variant="ghost" size="sm">Auto Rate</Button>
            <Button variant="ghost" size="sm">Audit</Button>
            <Button variant="ghost" size="sm">A &amp; I</Button>
            <Button variant="primary" size="sm" className="hidden sm:inline-flex">Generate Invoice</Button>
          </div>
        </div>
      </header>

      {/* Hero: order info + pickup/delivery side by side + compact stage */}
      <section className="od-hero">
        <div className="od-hero__grid">
          <div>
            <div className="od-info-grid">
              <InfoField label="Customer" value={order.customer} />
              <InfoField label="Bill To" value={order.billToCustomer} />
              <InfoField label="Division" value={order.division} />
              <InfoField label="Equipment" value={order.equipment} />
              <InfoField label="Trailer" value={order.trailerNo ?? '—'} />
              <InfoField label="Distance" value={order.distance ?? '—'} />
              <InfoField label="Lane" value={order.lane ?? '—'} />
              <InfoField label="Dispatcher" value={order.dispatcher ?? '—'} />
              <InfoField label="Billing Status" value={order.poBillingStatus} />
            </div>
          </div>

          <StopBlock type="pickup" stop={pickup} />
          <StopBlock type="delivery" stop={delivery} />
        </div>

        {order.workflow && (
          <div className="od-stage-row">
            <WorkflowStageCompact workflow={order.workflow} />
          </div>
        )}
      </section>

      {/* Split: charges left, details right */}
      <div className="od-split">
        <div className="od-panel od-panel--charges">
          <div className="od-tabs" style={{ justifyContent: 'space-between' }}>
            <div className="flex min-w-0 overflow-x-auto">
              {leftTabs.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setLeftTab(t)}
                  className={cn('od-tabs__btn', leftTab === t && 'is-active')}
                >
                  {t}
                  {(t === 'Notes' || t === 'Instructions') && ' (0)'}
                </button>
              ))}
            </div>
            {leftTab === 'Charges' && (
              <Button size="sm" variant="ghost" className="!mr-2 !h-7 shrink-0">
                <Plus size={14} strokeWidth={1.7} /> Add
              </Button>
            )}
          </div>

          <div className="od-panel__body">
            {leftTab === 'Charges' && (
              <div className="overflow-x-auto">
                <table className="od-charges-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Description</th>
                      <th className="num">Price</th>
                      <th>Qty</th>
                      <th className="num">Total</th>
                      <th className="sr-col-hide-md">Created</th>
                      <th style={{ width: 28 }} />
                    </tr>
                  </thead>
                  <tbody>
                    {charges.length ? (
                      charges.map((c, i) => (
                        <tr key={i}>
                          <td className="item">{c.item}</td>
                          <td>{c.description}</td>
                          <td className="num">{formatCurrency(c.price, order.currency)}</td>
                          <td>{c.qty}</td>
                          <td className="num">{formatCurrency(c.total, order.currency)}</td>
                          <td className="sr-col-hide-md text-[11px]">{formatDate(c.createdOn)}</td>
                          <td>
                            <button type="button" className="rounded p-1 text-[var(--sr-text-meta)] hover:text-[var(--sr-negative)]">
                              <Trash2 size={14} strokeWidth={1.7} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-[var(--sr-text-meta)]">
                          No charges on this order
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            {leftTab === 'Internal Ratings' && (
              <EmptyPanel title="Internal Ratings" hint="Rating details will appear here when configured." />
            )}
            {leftTab === 'Related PO' && <RelatedPOTable order={order} />}
            {leftTab === 'Notes' && <EmptyPanel title="No notes" hint="Add notes for this order." actionLabel="Add note" />}
            {leftTab === 'Instructions' && <EmptyPanel title="No instructions" hint="Special handling instructions appear here." />}
          </div>

          {leftTab === 'Charges' && (
            <div className="od-summary">
              <span>Base <strong className="tabular-nums">{formatCurrency(totals.base, order.currency)}</strong></span>
              <span>FSC <strong className="tabular-nums">{formatCurrency(totals.fsc, order.currency)}</strong></span>
              <span>Subtotal <strong className="tabular-nums">{formatCurrency(totals.sub, order.currency)}</strong></span>
              <span className="od-summary__total">Total {formatCurrency(totals.total || order.invoiceAmount, order.currency)}</span>
            </div>
          )}
        </div>

        <div className="od-panel od-panel--side">
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
            {rightTab === 'Order Details' && <OrderDetailsPanel order={order} />}
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

function InfoField({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <div className="od-field">
      <div className="od-field__label">{label}</div>
      <div className="od-field__value">{value}</div>
    </div>
  )
}

function StopBlock({ type, stop }: { type: 'pickup' | 'delivery'; stop: NonNullable<Order['pickup']> }) {
  return (
    <div className="od-stop">
      <div className={cn('od-stop__type', type === 'delivery' && 'od-stop__type--delivery')}>
        {type === 'pickup' ? 'Shipper · Pickup' : 'Consignee · Delivery'}
      </div>
      <p className="od-stop__name">{stop.facility}</p>
      <p className="od-stop__addr">
        {stop.address}
        <br />
        {stop.city}, {stop.state} {stop.zip}
      </p>
      <dl className="od-stop__time">
        <dt>Scheduled</dt>
        <dd>{stop.schedule}</dd>
        {stop.actual && (
          <>
            <dt>Actual</dt>
            <dd style={{ color: 'var(--sr-positive)' }}>{stop.actual}</dd>
          </>
        )}
        {stop.referenceNo && (
          <>
            <dt>Ref</dt>
            <dd className="font-mono text-[10px]">{stop.referenceNo}</dd>
          </>
        )}
      </dl>
      {stop.notes && (
        <p className="mt-2 rounded px-2 py-1.5 text-[10px]" style={{ background: '#FDF1E0', color: '#9A5B00' }}>
          {stop.notes}
        </p>
      )}
    </div>
  )
}

function OrderDetailsPanel({ order }: { order: Order }) {
  const fields = [
    { label: 'Bill To Address', value: order.billToAddress },
    { label: 'Currency', value: order.currency ?? 'CAD' },
    { label: 'PO No.', value: order.poNo },
    { label: "Caller's Name", value: order.callerName },
    { label: 'Sales Rep', value: order.salesRep },
    { label: 'Invoice Status', value: order.invoiceStatus },
    { label: 'Invoice Amount', value: formatCurrency(order.invoiceAmount, order.currency) },
    { label: 'Pick Up Date', value: formatDate(order.pickUpDate) },
    { label: 'Delivery Date', value: formatDate(order.deliveryDate) },
    { label: 'Late Invoice Reason', value: order.reasonForLateInvoice ?? 'None' },
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
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <Button variant="ghost" size="sm">Index as Pedimento</Button>
        <Button variant="ghost" size="sm">Index as POD</Button>
      </div>
      <div className="space-y-2">
        {documents.map((folder) => (
          <div key={folder.category}>
            <div className="flex items-center gap-1.5 text-[12px] font-semibold">
              <Folder size={14} strokeWidth={1.7} className="text-[var(--sr-text-meta)]" />
              {folder.category}
            </div>
            <div className="ml-5 mt-1 space-y-0.5">
              {folder.files.map((f) => (
                <button
                  key={f.name}
                  type="button"
                  onClick={() => onSelect(f.name)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12px] transition-colors',
                    active === f.name
                      ? 'font-medium text-[var(--sr-action)]'
                      : 'text-[var(--sr-text-secondary)] hover:bg-[var(--sr-surface-2)]'
                  )}
                  style={active === f.name ? { background: 'var(--accent-soft)' } : undefined}
                >
                  <FileText size={14} strokeWidth={1.7} />
                  <span className="truncate">{f.name}</span>
                  <ChevronRight size={12} strokeWidth={1.7} className="ml-auto shrink-0" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <Card className="flex min-h-[200px] flex-col overflow-hidden !rounded-lg !border-[var(--sr-border-1)]">
        <div className="flex items-center gap-1 border-b border-[var(--sr-border-1)] bg-[var(--sr-surface-2)] px-2 py-1.5">
          {[ZoomOut, ZoomIn, RotateCw, Maximize2].map((Icon, i) => (
            <button key={i} type="button" className="rounded p-1.5 text-[var(--sr-text-meta)] hover:bg-white">
              <Icon size={14} strokeWidth={1.7} />
            </button>
          ))}
          <span className="ml-auto truncate text-[10px] text-[var(--sr-text-meta)]">{active}</span>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center bg-[var(--sr-bg-app)] p-6 text-center">
          {active ? (
            <>
              <FileText size={32} strokeWidth={1.5} className="text-[var(--sr-text-meta)]" />
              <p className="mt-2 text-[13px] font-semibold">{active}</p>
              <p className="mt-1 text-[11px] text-[var(--sr-text-meta)]">Connect PDF viewer for production</p>
            </>
          ) : (
            <p className="text-[13px] text-[var(--sr-text-meta)]">Select a document</p>
          )}
        </div>
      </Card>
    </div>
  )
}

function RelatedPOTable({ order }: { order: Order }) {
  return (
    <table className="od-charges-table">
      <thead>
        <tr>
          <th>Order No.</th>
          <th>PO Category</th>
          <th>Billing</th>
          <th>Customer PO</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="item font-mono">{order.orderNo}</td>
          <td>{order.poCategory}</td>
          <td>{order.poBillingStatus}</td>
          <td>{order.poNo}</td>
        </tr>
      </tbody>
    </table>
  )
}

function EmptyPanel({ title, hint, actionLabel }: { title: string; hint: string; actionLabel?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-[14px] font-semibold">{title}</p>
      <p className="mt-1 text-[13px] text-[var(--sr-text-meta)]">{hint}</p>
      {actionLabel && <Button variant="ghost" size="sm" className="mt-4">{actionLabel}</Button>}
    </div>
  )
}
