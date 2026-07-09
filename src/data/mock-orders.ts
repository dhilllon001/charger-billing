import type { Order, PipelineStage, OrderStatus, AiCheck } from './models'

const customers = [
  'Labatt Brewing Co', 'Abbott Laboratories Co (Canada)', 'BMW SLP S.A. de C.V.', 'P&G',
  'Volkswagen de México', 'Canada Post Corp', 'Arlanxeo Canada', 'Brose North America',
  'Hitachi Astemo Silao', 'Pirelli Neumáticos', 'Ekaterra Global', 'Hisense USA Corp',
  'Natra Chocolate', 'World Courier of Canada', 'Charger', 'The Home Depot Mexico',
]

const stages: PipelineStage[] = ['rate_validated', 'ops_validated', 'pod_verified', 'rfi', 'ready', 'invoiced', 'email_delivery', 'as']
const statuses: OrderStatus[] = ['ready', 'needs_review', 'blocked', 'in_validation']
const aiChecks: AiCheck[] = [
  { state: 'auto_validated', confidence: 0.97 },
  { state: 'rate_variance', detail: '−4.2%', confidence: 0.82 },
  { state: 'pod_missing', detail: 'POD missing' },
  { state: 'awaiting_ops', detail: 'Awaiting ops' },
]

function makeOrder(i: number, stage: PipelineStage): Order {
  const customer = customers[i % customers.length]
  const status = stage === 'ready' ? 'ready' : statuses[i % statuses.length]
  const aiCheck = stage === 'ready' ? aiChecks[0] : aiChecks[i % aiChecks.length]
  const amount = 1200 + (i * 847) % 45000

  return {
    id: `ord-${String(i + 1).padStart(4, '0')}`,
    orderNo: `CL-${2026000 + i}`,
    poNo: `PO-${88000 + i}`,
    customer,
    billToCustomer: customer,
    division: ['East', 'West', 'Central', 'Quebec'][i % 4],
    poCategory: ['Standard', 'Expedited', 'Contract'][i % 3],
    poBillingStatus: i % 7 === 0 ? 'Hold' : i % 5 === 0 ? 'Billed' : 'Pending',
    orderDate: `2026-06-${String((i % 28) + 1).padStart(2, '0')}`,
    pickUpDate: `2026-07-${String((i % 8) + 1).padStart(2, '0')}`,
    deliveryDate: `2026-07-${String((i % 8) + 3).padStart(2, '0')}`,
    pickupLocation: 'Toronto DC',
    pickupCity: ['Toronto', 'Montreal', 'Chicago', 'Detroit'][i % 4],
    pickupState: ['ON', 'QC', 'IL', 'MI'][i % 4],
    deliveryLocation: 'Customer Facility',
    deliveryCity: ['London', 'Windsor', 'Buffalo', 'Cleveland'][i % 4],
    deliveryState: ['ON', 'ON', 'NY', 'OH'][i % 4],
    callerName: ['John Smith', 'Maria Garcia', 'David Chen', 'Sarah Wilson'][i % 4],
    invoiceAmount: amount,
    invoiceAvgCount: `${(amount / 3).toFixed(0)} / 3`,
    reasonCode: i % 9 === 0 ? 'RATE_ADJ' : undefined,
    invoiceStatus: ['Open', 'Draft', 'Pending'][i % 3],
    audited: i % 3 !== 0,
    draftInvoice: i % 4 === 0,
    draftInvoiceNo: i % 4 === 0 ? `DRF-${202600 + i}` : undefined,
    status,
    invoiceDue: `2026-08-${String((i % 20) + 1).padStart(2, '0')}`,
    equipment: ['FTL', 'LTL', 'Reefer', 'Dry Van'][i % 4] as Order['equipment'],
    stage,
    aiCheck,
  }
}

export const orders: Order[] = [
  ...Array.from({ length: 12 }, (_, i) => makeOrder(i, 'rate_validated')),
  ...Array.from({ length: 8 }, (_, i) => makeOrder(i + 12, 'ops_validated')),
  ...Array.from({ length: 10 }, (_, i) => makeOrder(i + 20, 'pod_verified')),
  ...Array.from({ length: 6 }, (_, i) => makeOrder(i + 30, 'rfi')),
  ...Array.from({ length: 15 }, (_, i) => makeOrder(i + 36, 'ready')),
  ...Array.from({ length: 5 }, (_, i) => makeOrder(i + 51, 'invoiced')),
  ...Array.from({ length: 3 }, (_, i) => makeOrder(i + 56, 'email_delivery')),
  ...Array.from({ length: 2 }, (_, i) => makeOrder(i + 59, 'as')),
]

export function getStageCounts(): Record<PipelineStage, number> {
  const counts: Record<string, number> = { all: orders.length }
  for (const stage of stages) {
    counts[stage] = orders.filter((o) => o.stage === stage).length
  }
  return counts as Record<PipelineStage, number>
}
