import { useState, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Copy, Plus, Trash2, FileText, Folder, ChevronRight,
  ZoomIn, ZoomOut, RotateCw, Maximize2,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Pill } from '@/components/ui/Pill'
import { WorkflowBar } from '@/components/ui/WorkflowStepper'
import { getOrderById } from '@/data/mock-orders'
import { formatCurrency, formatDate } from '@/lib/format'
import { useUiStore } from '@/stores/ui-store'
import { cn } from '@/lib/cn'
import type { Order, OrderDocument } from '@/data/models'

const leftTabs = ['Charges', 'Internal Ratings', 'Related PO', 'Notes', 'Instructions'] as const
const rightTabs = ['Order Details', 'Shipper & Consignee', 'Documents'] as const

export function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const addToast = useUiStore((s) => s.addToast)
  const order = getOrderById(orderId ?? '')

  const [leftTab, setLeftTab] = useState<typeof leftTabs[number]>('Charges')
  const [rightTab, setRightTab] = useState<typeof rightTabs[number]>('Order Details')
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


  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="-mx-4 flex min-h-[calc(100vh-8rem)] flex-col sm:-mx-6 lg:-mx-7"
    >
      {/* Header */}
      <div className="border-b border-line bg-card px-4 py-4 sm:px-6 lg:px-7">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-[12px] font-medium text-ink-2 hover:bg-black/[0.04]"
          >
            <ArrowLeft size={14} strokeWidth={1.7} /> Back
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[20px] font-bold tracking-[-0.02em] sm:text-[22px]">
                Order · {order.orderNo}
              </h1>
              <button
                onClick={() => { navigator.clipboard.writeText(order.orderNo); addToast('Order # copied') }}
                className="rounded-lg p-1 text-ink-3 hover:bg-black/[0.05]"
              >
                <Copy size={14} strokeWidth={1.7} />
              </button>
              {order.probillId && <Pill variant="blue">{order.probillId}</Pill>}
            </div>
            <p className="mt-0.5 text-[12px] text-ink-3">
              Order Date: {formatDate(order.orderDate)} · {order.customer}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" size="sm">Auto Rate</Button>
            <Button variant="ghost" size="sm">Audit</Button>
            <Button variant="ghost" size="sm">A &amp; I</Button>
            <Button variant="ghost" size="sm" className="hidden md:inline-flex">A &amp; I &amp; Send</Button>
            <Button variant="ghost" size="sm">CP Rate</Button>
          </div>
        </div>
      </div>

      {/* Workflow stages */}
      <div className="border-b border-line bg-bg px-4 py-4 sm:px-6 lg:px-7">
        {order.workflow && (
          <WorkflowBar
            workflow={order.workflow}
            activeKey={
              order.workflow.operationValidation.status === 'passed' ? 'operationValidation' : 'rateValidation'
            }
          />
        )}
      </div>

      {/* Split panels */}
      <div className="flex flex-1 flex-col gap-0 xl:flex-row">
        {/* LEFT — billing tabs */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col border-b border-line xl:border-b-0 xl:border-r">
          <div className="flex items-center justify-between gap-2 border-b border-line bg-[#FCFCFD] px-4 py-2">
            <div className="flex gap-1 overflow-x-auto">
              {leftTabs.map((t) => (
                <button
                  key={t}
                  onClick={() => setLeftTab(t)}
                  className={cn(
                    'shrink-0 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors',
                    leftTab === t ? 'bg-ink text-white' : 'text-ink-2 hover:bg-black/[0.05]'
                  )}
                >
                  {t}{t === 'Notes' || t === 'Instructions' ? ' (0)' : ''}
                </button>
              ))}
            </div>
            {leftTab === 'Charges' && (
              <Button size="sm" variant="ghost"><Plus size={14} strokeWidth={1.7} /> Add</Button>
            )}
          </div>

          <div className="flex-1 overflow-auto p-4">
            {leftTab === 'Charges' && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-[12px]">
                  <thead>
                    <tr className="border-b border-line text-left text-[10px] font-semibold uppercase tracking-[0.05em] text-ink-3">
                      <th className="pb-2 pr-3">Item</th>
                      <th className="pb-2 pr-3">Description</th>
                      <th className="pb-2 pr-3 text-right">Price ($)</th>
                      <th className="pb-2 pr-3">Qty</th>
                      <th className="pb-2 pr-3">Tax Code</th>
                      <th className="pb-2 pr-3 text-right">Total</th>
                      <th className="pb-2 pr-3">Created On</th>
                      <th className="pb-2 pr-3">Created By</th>
                      <th className="pb-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {charges.length ? charges.map((c, i) => (
                      <tr key={i} className="border-b border-line hover:bg-[#F7F9FC]">
                        <td className="py-3 pr-3 font-semibold">{c.item}</td>
                        <td className="py-3 pr-3 text-ink-2">{c.description}</td>
                        <td className="py-3 pr-3 text-right tabular-nums">{formatCurrency(c.price, order.currency)}</td>
                        <td className="py-3 pr-3 tabular-nums">{c.qty}</td>
                        <td className="py-3 pr-3 text-ink-3">{c.taxCode ?? '—'}</td>
                        <td className="py-3 pr-3 text-right font-semibold tabular-nums">{formatCurrency(c.total, order.currency)}</td>
                        <td className="py-3 pr-3 text-ink-3 whitespace-nowrap">{formatDate(c.createdOn)}</td>
                        <td className="py-3 pr-3 text-ink-3 max-w-[100px] truncate">{c.createdBy}</td>
                        <td className="py-3">
                          <button className="rounded p-1 text-ink-3 hover:bg-red-soft hover:text-red"><Trash2 size={14} strokeWidth={1.7} /></button>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={9} className="py-12 text-center text-ink-3">No charges on this order</td></tr>
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

          {/* Billing summary footer */}
          {leftTab === 'Charges' && (
            <div className="border-t border-line bg-[#FCFCFD] px-4 py-3">
              <div className="flex flex-wrap items-center justify-end gap-x-6 gap-y-1 text-[12px]">
                <span className="text-ink-3">Base Charges <strong className="ml-1 tabular-nums text-ink">{formatCurrency(totals.base, order.currency)}</strong></span>
                <span className="text-ink-3">FSC Amount <strong className="ml-1 tabular-nums text-ink">{formatCurrency(totals.fsc, order.currency)}</strong></span>
                <span className="text-ink-3">Sub Total <strong className="ml-1 tabular-nums text-ink">{formatCurrency(totals.sub, order.currency)}</strong></span>
                <span className="text-ink-3">Tax <strong className="ml-1 tabular-nums text-ink">{formatCurrency(totals.tax, order.currency)}</strong></span>
                <span className="text-[14px] font-bold">Total <strong className="ml-1 tabular-nums text-accent">{formatCurrency(totals.total || order.invoiceAmount, order.currency)}</strong></span>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT — order / shipper / documents */}
        <div className="flex w-full shrink-0 flex-col xl:w-[min(440px,42%)]">
          <div className="flex gap-1 overflow-x-auto border-b border-line bg-[#FCFCFD] px-4 py-2">
            {rightTabs.map((t) => (
              <button
                key={t}
                onClick={() => setRightTab(t)}
                className={cn(
                  'shrink-0 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors',
                  rightTab === t ? 'bg-ink text-white' : 'text-ink-2 hover:bg-black/[0.05]'
                )}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-auto p-4">
            {rightTab === 'Order Details' && <OrderDetailsPanel order={order} />}
            {rightTab === 'Shipper & Consignee' && <ShipperPanel order={order} />}
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

function OrderDetailsPanel({ order }: { order: Order }) {
  const fields = [
    { label: 'Customer', value: order.customer },
    { label: 'Bill To', value: order.billToCustomer },
    { label: 'Bill To Address', value: order.billToAddress },
    { label: 'Currency', value: order.currency ?? 'CAD' },
    { label: 'PO No.', value: order.poNo, mono: true },
    { label: 'Division', value: order.division },
    { label: "Caller's Name", value: order.callerName || '—' },
    { label: 'Lane', value: order.lane },
    { label: 'Equipment', value: order.equipment },
    { label: 'Trailer No.', value: order.trailerNo },
    { label: 'Distance', value: order.distance },
    { label: 'Dispatcher', value: order.dispatcher },
    { label: 'Sales Rep', value: order.salesRep || '—' },
    { label: 'Reason for Late Invoice', value: order.reasonForLateInvoice ?? 'None' },
    { label: 'Instruction', value: order.instruction || '—' },
  ]

  return (
    <dl className="space-y-4">
      {fields.map((f) => f.value ? (
        <div key={f.label}>
          <dt className="text-[10px] font-semibold uppercase tracking-[0.05em] text-ink-3">{f.label}</dt>
          <dd className={cn('mt-1 text-[13px] text-ink', f.mono && 'font-mono font-semibold')}>{f.value}</dd>
        </div>
      ) : null)}
      <Link to="/batch-invoicing" className="inline-block text-[12px] font-medium text-accent hover:underline">Edit customer assignment →</Link>
    </dl>
  )
}

function ShipperPanel({ order }: { order: Order }) {
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
    <div className="space-y-6">
      <StopCard stop={pickup} />
      {order.distance && (
        <div className="flex items-center gap-3 pl-4">
          <div className="h-8 w-px bg-line" />
          <span className="text-[12px] font-medium text-ink-3">{order.distance}</span>
        </div>
      )}
      <StopCard stop={delivery} />
    </div>
  )
}

function StopCard({ stop }: { stop: NonNullable<Order['pickup']> }) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <Pill variant="blue">{stop.label}</Pill>
        {stop.referenceNo && <span className="font-mono text-[11px] text-ink-3">{stop.referenceNo}</span>}
      </div>
      <p className="mt-3 text-[14px] font-semibold leading-snug">{stop.facility}</p>
      <p className="mt-1 text-[12px] text-ink-2">{stop.address}</p>
      <p className="text-[12px] text-ink-2">{stop.city}, {stop.state} {stop.zip}</p>
      <div className="mt-4 space-y-2 border-t border-line pt-3 text-[12px]">
        <div className="flex justify-between"><span className="text-ink-3">Scheduled</span><span className="font-medium">{stop.schedule}</span></div>
        {stop.actual && <div className="flex justify-between"><span className="text-ink-3">Actual</span><span className="font-medium text-green">{stop.actual}</span></div>}
      </div>
      {stop.notes && (
        <p className="mt-3 rounded-lg bg-orange-soft/50 px-3 py-2 text-[11px] text-orange">{stop.notes}</p>
      )}
    </Card>
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
    <div className="flex h-full min-h-[320px] flex-col gap-4">
      <div className="flex gap-2">
        <Button variant="ghost" size="sm">Index as Pedimento</Button>
        <Button variant="ghost" size="sm">Index as POD</Button>
      </div>
      <div className="space-y-2">
        {documents.map((folder) => (
          <div key={folder.category}>
            <div className="flex items-center gap-1.5 text-[12px] font-semibold text-ink">
              <Folder size={14} strokeWidth={1.7} className="text-ink-3" />
              {folder.category}
            </div>
            <div className="ml-5 mt-1 space-y-0.5">
              {folder.files.map((f) => (
                <button
                  key={f.name}
                  onClick={() => onSelect(f.name)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[12px] transition-colors',
                    active === f.name ? 'bg-accent-soft font-medium text-accent' : 'text-ink-2 hover:bg-black/[0.04]'
                  )}
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
      <Card className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center gap-1 border-b border-line bg-black/[0.02] px-2 py-1.5">
          {[ZoomOut, ZoomIn, RotateCw, Maximize2].map((Icon, i) => (
            <button key={i} className="rounded p-1.5 text-ink-3 hover:bg-black/[0.05]"><Icon size={14} strokeWidth={1.7} /></button>
          ))}
          <span className="ml-auto truncate text-[10px] text-ink-3">{active}</span>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center bg-[#F5F5F7] p-6 text-center">
          {active ? (
            <>
              <div className="mb-3 flex h-16 w-12 items-center justify-center rounded border border-line bg-white shadow-sm">
                <FileText size={24} strokeWidth={1.7} className="text-ink-3" />
              </div>
              <p className="text-[13px] font-semibold text-ink">Bill of Lading</p>
              <p className="mt-1 max-w-[200px] text-[11px] text-ink-3">{active}</p>
              <p className="mt-3 text-[11px] text-ink-3">Document preview — connect PDF viewer for production</p>
            </>
          ) : (
            <p className="text-[13px] text-ink-3">Select a document to preview</p>
          )}
        </div>
      </Card>
    </div>
  )
}

function RelatedPOTable({ order }: { order: Order }) {
  return (
    <table className="w-full text-[12px]">
      <thead>
        <tr className="border-b border-line text-left text-[10px] font-semibold uppercase text-ink-3">
          <th className="pb-2">Order No.</th><th className="pb-2">PO Category</th><th className="pb-2">Billing Status</th>
          <th className="pb-2">PO Status</th><th className="pb-2">Customer PO No.</th><th className="pb-2">Invoice Total</th>
        </tr>
      </thead>
      <tbody>
        <tr className="border-b border-line">
          <td className="py-2.5 font-mono font-semibold">{order.orderNo}</td>
          <td className="py-2.5">{order.poCategory}</td>
          <td className="py-2.5">{order.poBillingStatus}</td>
          <td className="py-2.5"><Pill variant="green">DELIVERED</Pill></td>
          <td className="py-2.5">{order.poNo}</td>
          <td className="py-2.5 tabular-nums">—</td>
        </tr>
      </tbody>
    </table>
  )
}

function EmptyPanel({ title, hint, actionLabel }: { title: string; hint: string; actionLabel?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-[14px] font-semibold text-ink">{title}</p>
      <p className="mt-1 text-[13px] text-ink-3">{hint}</p>
      {actionLabel && <Button variant="ghost" size="sm" className="mt-4">{actionLabel}</Button>}
    </div>
  )
}
