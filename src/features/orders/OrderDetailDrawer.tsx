import { useState } from 'react'
import { Drawer } from '@/components/ui/Drawer'
import { Pill } from '@/components/ui/Pill'
import { WorkflowStepper } from '@/components/ui/WorkflowStepper'
import { CopyableMono } from '@/components/ui/Table'
import { formatCurrency, formatDate } from '@/lib/format'
import type { Order } from '@/data/models'
import { cn } from '@/lib/cn'

const tabs = ['Order Details', 'Shipper & Consignee', 'Charges', 'Related PO', 'Notes'] as const

interface OrderDetailDrawerProps {
  order: Order | null
  onClose: () => void
}

export function OrderDetailDrawer({ order, onClose }: OrderDetailDrawerProps) {
  const [tab, setTab] = useState<typeof tabs[number]>('Order Details')

  if (!order) return null

  const charges = order.charges ?? []
  const chargeTotal = charges.reduce((s, c) => s + c.total, 0)

  return (
    <Drawer open={!!order} onClose={onClose} title={`Order ${order.orderNo}`} width={720} className="max-w-[100vw]">
      <div className="flex h-full flex-col">
        <div className="border-b border-line px-5 py-4">
          <div className="flex flex-wrap items-center gap-3">
            <CopyableMono value={order.orderNo} />
            <span className="text-[12px] text-ink-3">{formatDate(order.orderDate)}</span>
            {order.probillId && <Pill variant="blue">{order.probillId}</Pill>}
          </div>
          {order.workflow && <div className="mt-4"><WorkflowStepper workflow={order.workflow} compact /></div>}
        </div>

        <div className="flex gap-1 overflow-x-auto border-b border-line px-5 py-2">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'shrink-0 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors',
                tab === t ? 'bg-ink text-white' : 'text-ink-2 hover:bg-black/[0.04]'
              )}
            >
              {t}{t === 'Notes' ? ' (0)' : ''}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {tab === 'Order Details' && (
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Detail label="Customer" value={order.customer} />
              <Detail label="Bill To" value={order.billToCustomer} />
              {order.billToAddress && <Detail label="Bill To Address" value={order.billToAddress} className="sm:col-span-2" />}
              <Detail label="Currency" value={order.currency ?? 'CAD'} />
              <Detail label="PO No." value={order.poNo} mono />
              <Detail label="Division" value={order.division} />
              <Detail label="Caller's Name" value={order.callerName || '—'} />
              <Detail label="Lane" value={order.lane ?? '—'} className="sm:col-span-2" />
              <Detail label="Equipment" value={order.equipment} />
              <Detail label="Dispatcher" value={order.dispatcher ?? '—'} />
              <Detail label="Reason for Late Invoice" value={order.reasonForLateInvoice ?? 'None'} />
              <Detail label="Instruction" value={order.instruction ?? '—'} className="sm:col-span-2" />
            </dl>
          )}

          {tab === 'Shipper & Consignee' && (
            <div className="grid gap-6 sm:grid-cols-2">
              <LocationCard title="Pickup" location={order.pickupLocation} city={order.pickupCity} state={order.pickupState} date={order.pickUpDate} />
              <LocationCard title="Delivery" location={order.deliveryLocation} city={order.deliveryCity} state={order.deliveryState} date={order.deliveryDate} />
            </div>
          )}

          {tab === 'Charges' && (
            <div>
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-line text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-ink-3">
                    <th className="pb-2">Item</th><th className="pb-2">Description</th><th className="pb-2 text-right">Price</th><th className="pb-2">Qty</th><th className="pb-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {charges.length ? charges.map((c, i) => (
                    <tr key={i} className="border-b border-line">
                      <td className="py-2.5 font-medium">{c.item}</td>
                      <td className="py-2.5 text-ink-2">{c.description}</td>
                      <td className="py-2.5 text-right tabular-nums">{formatCurrency(c.price)}</td>
                      <td className="py-2.5 tabular-nums">{c.qty}</td>
                      <td className="py-2.5 text-right font-semibold tabular-nums">{formatCurrency(c.total)}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={5} className="py-8 text-center text-ink-3">No charges added</td></tr>
                  )}
                </tbody>
              </table>
              <div className="mt-4 flex flex-wrap justify-end gap-4 rounded-xl bg-black/[0.02] p-4 text-[12px]">
                <span>Base: <strong className="tabular-nums">{formatCurrency(chargeTotal * 0.78)}</strong></span>
                <span>FSC: <strong className="tabular-nums">{formatCurrency(chargeTotal * 0.22)}</strong></span>
                <span>Total: <strong className="tabular-nums text-[14px]">{formatCurrency(chargeTotal || order.invoiceAmount)}</strong></span>
              </div>
            </div>
          )}

          {tab === 'Related PO' && (
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-line text-left text-[11px] font-semibold uppercase text-ink-3">
                  <th className="pb-2">Order No.</th><th className="pb-2">PO Category</th><th className="pb-2">Billing Status</th><th className="pb-2">PO Status</th><th className="pb-2">Customer PO No.</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-line">
                  <td className="py-2.5 font-mono font-semibold">{order.orderNo}</td>
                  <td className="py-2.5">{order.poCategory}</td>
                  <td className="py-2.5">{order.poBillingStatus}</td>
                  <td className="py-2.5"><Pill variant="green">Delivered</Pill></td>
                  <td className="py-2.5">{order.poNo}</td>
                </tr>
              </tbody>
            </table>
          )}

          {tab === 'Notes' && (
            <p className="text-center text-[13px] text-ink-3 py-12">No notes for this order.</p>
          )}
        </div>

        {order.documents && (
          <div className="border-t border-line p-4">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.05em] text-ink-3">Documents</p>
            <div className="flex flex-wrap gap-2">
              {order.documents.flatMap((d) => d.files.map((f) => (
                <span key={f.name} className="rounded-lg border border-line bg-white px-2.5 py-1 text-[11px] text-ink-2">{d.category}: {f.name}</span>
              )))}
            </div>
          </div>
        )}
      </div>
    </Drawer>
  )
}

function Detail({ label, value, mono, className }: { label: string; value: string; mono?: boolean; className?: string }) {
  return (
    <div className={className}>
      <dt className="text-[11px] font-medium uppercase tracking-[0.04em] text-ink-3">{label}</dt>
      <dd className={cn('mt-0.5 text-[13px] text-ink', mono && 'font-mono font-semibold')}>{value}</dd>
    </div>
  )
}

function LocationCard({ title, location, city, state, date }: { title: string; location: string; city: string; state: string; date: string }) {
  return (
    <div className="rounded-xl border border-line p-4">
      <p className="text-[11px] font-semibold uppercase text-ink-3">{title}</p>
      <p className="mt-2 text-[13px] font-semibold">{location}</p>
      <p className="text-[12px] text-ink-2">{city}, {state}</p>
      <p className="mt-2 text-[12px] text-ink-3">{formatDate(date)}</p>
    </div>
  )
}
