import type { Order, PipelineStage, OrderStatus, AiCheck, OrderWorkflow } from './models'
import { rateValidationFilters, opsValidationFilters } from './validation-filters'

const legacyCustomers = [
  'COLGATE-PALMOLIVE CANADA INC.', 'TENNECO INC', 'Labatt Brewing Co', 'Abbott Laboratories Co (Canada)',
  'BMW SLP S.A. de C.V.', 'P&G', 'NEOVIA LOGISTICS', 'K-Flex de México', 'Amazon Logistics USA',
  'ANHEUSER BUSCH', 'RIVERSIDE NATURAL FOODS LTD', 'The Home Depot Mexico', 'DOLLAR TREE',
]

const stages: PipelineStage[] = ['rate_validated', 'ops_validated', 'pod_verified', 'rfi', 'ready', 'invoiced', 'email_delivery', 'as']
void stages
const statuses: OrderStatus[] = ['ready', 'needs_review', 'blocked', 'in_validation']
const validationGroups = ['no_error', 'operation_validation', 'rate_validation'] as const
const rateFilters = rateValidationFilters.filter((f) => !f.variant).map((f) => f.id)
const opsFilters = opsValidationFilters.filter((f) => !f.variant).map((f) => f.id)

function defaultWorkflow(i: number): OrderWorkflow {
  const rateOk = i % 5 !== 1
  const opsOk = i % 7 !== 2
  const rateWarning = i % 5 === 1
  return {
    rateValidation: rateWarning
      ? { status: 'warning', checksPassed: 3, checksTotal: 4, detail: '1 check shows warning' }
      : { status: rateOk ? 'passed' : 'failed', checksPassed: rateOk ? 4 : 2, checksTotal: 4 },
    operationValidation: { status: opsOk ? 'passed' : 'failed', checksPassed: opsOk ? 14 : 8, checksTotal: 14 },
    podPending: { status: i % 4 === 0 ? 'pending' : 'passed', checksPassed: i % 4 === 0 ? 0 : 1, checksTotal: 1 },
    autoInvoicing: { status: 'waiting', label: 'Waiting' },
    invoiceDelivery: { status: 'waiting', label: 'Not delivered yet' },
    accountingSync: { status: 'pending', label: 'Pending' },
  }
}

function makeShipperStops(i: number, order: Partial<Order>) {
  return {
    pickup: {
      label: 'PICKUP',
      facility: order.pickupLocation ?? 'Facility',
      address: order.pickupLocation ?? '',
      city: order.pickupCity ?? '',
      state: order.pickupState ?? '',
      zip: i % 2 === 0 ? '60491' : '46714',
      referenceNo: `803202${67 + i}`,
      schedule: '07/08/2026 09:00 AM',
      actual: '07/08/2026 09:15 AM – 11:30 AM',
    },
    delivery: {
      label: 'DELIVERY',
      facility: order.deliveryLocation ?? 'Facility',
      address: order.deliveryLocation ?? '',
      city: order.deliveryCity ?? '',
      state: order.deliveryState ?? '',
      zip: '46714',
      schedule: '07/09/2026 10:47 AM',
      actual: '07/09/2026 10:33 AM – 10:47 AM',
    },
  }
}

function makeOrder(i: number, stage: PipelineStage): Order {
  const customer = legacyCustomers[i % legacyCustomers.length]
  const status = stage === 'ready' ? 'ready' : statuses[i % statuses.length]
  const aiCheck: AiCheck = stage === 'ready'
    ? { state: 'auto_validated', confidence: 0.97 }
    : [{ state: 'rate_variance', detail: '−4.2%' }, { state: 'pod_missing' }, { state: 'awaiting_ops' }][i % 3] as AiCheck
  const amount = 1200 + (i * 847) % 45000

  return {
    id: `ord-${String(i + 1).padStart(4, '0')}`,
    orderNo: `L${11260000 + i}`,
    poNo: `${930700000 + i}`,
    customer,
    billToCustomer: customer.includes('COLGATE') ? 'COLGATE-PALMOLIVE c/o Uber Freight' : customer,
    billToAddress: customer.includes('COLGATE') ? 'PO Box 429, LOWELL, 72745' : undefined,
    division: ['CHARGER LOGISTICS', 'CHARGER DEDICATED', 'CHARGER GLOBAL'][i % 3],
    poCategory: 'DFM',
    poBillingStatus: i % 7 === 0 ? 'Hold' : i % 5 === 0 ? 'Billed' : 'Pending',
    orderDate: `2026-06-${String((i % 28) + 1).padStart(2, '0')}T15:31:00`,
    pickUpDate: `2026-07-${String((i % 8) + 1).padStart(2, '0')}T09:00:00`,
    deliveryDate: `2026-07-${String((i % 8) + 3).padStart(2, '0')}T10:53:00`,
    pickupLocation: ['SAN JOSE ITURBIDE', 'PECO Mississauga', 'Smyrna', 'Toronto DC'][i % 4],
    pickupCity: ['SAN JOSE ITURBIDE', 'Mississauga', 'Smyrna', 'Toronto'][i % 4],
    pickupState: ['GUANAJUATO', 'ONTARIO', 'TENNESSEE', 'ON'][i % 4],
    deliveryLocation: ['BOLTON', 'BRAMPTON', 'London', 'Windsor'][i % 4],
    deliveryCity: ['BOLTON', 'BRAMPTON', 'London', 'Windsor'][i % 4],
    deliveryState: ['ON', 'ON', 'ON', 'ON'][i % 4],
    callerName: i % 6 === 0 ? '' : ['John Smith', 'Maria Garcia'][i % 2],
    invoiceAmount: amount,
    invoiceAvgCount: `$${(amount / 3).toFixed(0)} / 3`,
    reasonCode: i % 9 === 0 ? 'RATE_ADJ' : undefined,
    invoiceStatus: 'Pending',
    audited: i % 3 !== 0,
    draftInvoice: i % 4 === 0,
    draftInvoiceNo: i % 4 === 0 ? `DRF-${202600 + i}` : undefined,
    status,
    invoiceDue: `2026-08-${String((i % 20) + 1).padStart(2, '0')}`,
    equipment: ['Dry Van', 'FTL', 'Reefer', 'LTL'][i % 4] as Order['equipment'],
    stage,
    aiCheck,
    currency: i % 5 === 0 ? 'USD' : 'CAD',
    probillId: `P${11419000 + i}`,
    hasPod: i % 4 !== 0,
    validationGroup: validationGroups[i % 3],
    validationFilter: i % 2 === 0 ? rateFilters[i % rateFilters.length] : opsFilters[i % opsFilters.length],
    workflow: defaultWorkflow(i),
    lane: 'CS_TO_CS, SAN JOSE ITURBIDE, GT - Bolton, ON',
    dispatcher: 'JOB_EDI204CONTROLLER@chargerlogistics.com',
    instruction: i % 8 === 0 ? 'DRIVER MUST BRING SECURITY VEST' : undefined,
    reasonForLateInvoice: 'None',
    trailerNo: `151B${String.fromCharCode(65 + (i % 26))}MSM`,
    distance: `${(120 + i * 13.7).toFixed(2)} Mi`,
    ...makeShipperStops(i, {
      pickupLocation: ['SAN JOSE ITURBIDE', 'PECO Mississauga', 'ID Logistics LCP', 'Toronto DC'][i % 4],
      pickupCity: ['SAN JOSE ITURBIDE', 'Mississauga', 'Lockport', 'Toronto'][i % 4],
      pickupState: ['GUANAJUATO', 'ON', 'IL', 'ON'][i % 4],
      deliveryLocation: ['BOLTON', 'BRAMPTON', 'Peyton', 'Windsor'][i % 4],
      deliveryCity: ['BOLTON', 'BRAMPTON', 'Bluffton', 'Windsor'][i % 4],
      deliveryState: ['ON', 'ON', 'IN', 'ON'][i % 4],
    }),
    charges: [
      { item: 'LUMPER', description: 'LUMPER CHARGE', price: 460, qty: 1, total: 460, createdOn: '2026-07-09T10:33:00', createdBy: 'uipathnotification@chargerlogistics.com' },
      { item: 'FRT', description: 'FREIGHT RATE', price: 950, qty: 1, total: 950, createdOn: '2026-07-07T16:42:00', createdBy: 'cf_billing_worker' },
    ],
    documents: [
      { category: 'Bill of Lading', files: [
        { name: `BOL_178360824${i}.pdf`, type: 'pdf' },
        { name: `BOL_178360825${i}.pdf`, type: 'pdf' },
      ]},
      { category: 'POD', files: [
        { name: `POD_178360824${i}.pdf`, type: 'pdf' },
        { name: `PROBILL-019147${i}.pdf`, type: 'pdf' },
      ]},
    ],
  }
}

export const orders: Order[] = [
  {
    ...makeOrder(0, 'rate_validated'),
    id: 'ord-showcase',
    orderNo: 'L11274836',
    poNo: '03491007044893',
    customer: 'TENNECO INC',
    billToCustomer: 'TENNECO INC',
    division: 'CHARGER LOGISTICS',
    probillId: 'P11432592',
    trailerNo: '151B0MSM',
    distance: '182.13 Mi',
    invoiceAmount: 1410,
    orderDate: '2026-07-07T16:42:00',
    workflow: {
      rateValidation: { status: 'warning', checksPassed: 3, checksTotal: 4, detail: '1 check shows warning' },
      operationValidation: { status: 'passed', checksPassed: 14, checksTotal: 14 },
      podPending: { status: 'passed', checksPassed: 0, checksTotal: 0, detail: '0 checks passed' },
      autoInvoicing: { status: 'waiting', label: 'Waiting' },
      invoiceDelivery: { status: 'waiting', label: 'Not delivered yet' },
      accountingSync: { status: 'pending', label: 'Pending' },
    },
    pickup: {
      label: 'PICKUP',
      facility: 'ID Logistics LCP',
      address: '2450 S Commerce Dr',
      city: 'Lockport',
      state: 'IL',
      zip: '60491',
      referenceNo: '80320267',
      schedule: '07/08/2026 09:00 AM – 11:00 AM',
      actual: '07/08/2026 09:15 AM – 11:30 AM',
      notes: 'Dock 12 · Check in at guard shack',
    },
    delivery: {
      label: 'DELIVERY',
      facility: 'Peyton — Bluffton Plant',
      address: '1200 E Washington St',
      city: 'Bluffton',
      state: 'IN',
      zip: '46714',
      referenceNo: 'PO-03491007044893',
      schedule: '07/09/2026 10:00 AM – 11:00 AM',
      actual: '07/09/2026 10:33 AM – 10:47 AM',
      notes: 'Receiver: Shipping Dept · Lumper required',
    },
    charges: [
      { item: 'LUMPER', description: 'LUMPER CHARGE', price: 460, qty: 1, total: 460, createdOn: '2026-07-09T10:33:00', createdBy: 'uipathnotification@chargerlogistics.com' },
      { item: 'FRT', description: 'FREIGHT RATE', price: 950, qty: 1, total: 950, createdOn: '2026-07-07T16:42:00', createdBy: 'cf_billing_worker' },
    ],
    billToAddress: 'PO Box 429, LOWELL, 72745',
    instruction: 'DRIVER MUST BRING SECURITY VEST',
    currency: 'USD',
    poBillingStatus: 'Hold',
    lane: 'CS_TO_CS, SAN JOSE ITURBIDE, GT - Bolton, ON',
    dispatcher: 'JOB_EDI204CONTROLLER@chargerlogistics.com',
    salesRep: 'Mike Reynolds',
    callerName: 'EDI Auto',
    documents: [
      { category: 'Bill of Lading', files: [{ name: 'BOL_1783608240.pdf', type: 'pdf' }] },
      { category: 'POD', files: [{ name: 'POD_1783608240.pdf', type: 'pdf' }, { name: 'PROBILL-0191470.pdf', type: 'pdf' }] },
    ],
  },
  ...Array.from({ length: 19 }, (_, i) => makeOrder(i + 1, 'rate_validated')),
  ...Array.from({ length: 15 }, (_, i) => makeOrder(i + 20, 'ops_validated')),
  ...Array.from({ length: 12 }, (_, i) => makeOrder(i + 35, 'pod_verified')),
  ...Array.from({ length: 8 }, (_, i) => makeOrder(i + 47, 'rfi')),
  ...Array.from({ length: 10 }, (_, i) => makeOrder(i + 55, 'ready')),
]

export function getStageCounts(): Record<PipelineStage, number> {
  const counts: Record<string, number> = {
    all: 1412,
    rate_validated: 735,
    ops_validated: 714,
    pod_verified: 460,
    rfi: 589,
    ready: 92,
    invoiced: 0,
    email_delivery: 0,
    as: 0,
  }
  return counts as Record<PipelineStage, number>
}

export function getOrderById(id: string) {
  return orders.find((o) => o.id === id)
}
