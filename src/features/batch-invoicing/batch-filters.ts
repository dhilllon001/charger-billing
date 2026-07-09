import { matchesColFilter } from '@/lib/report/filters'
import type { Order } from '@/data/models'

export type BatchFilters = {
  search: string
  searchScope: 'order' | 'po' | 'all'
  division: string
  customer: string
  poBillingStatus: string
  quickPod: boolean
  stage: string
  colFilters: Record<string, string | { min?: string; max?: string }>
}

export const DEFAULT_BATCH_FILTERS: BatchFilters = {
  search: '',
  searchScope: 'order',
  division: 'ALL',
  customer: 'ALL',
  poBillingStatus: 'ALL',
  quickPod: false,
  stage: 'all',
  colFilters: {},
}

export const BATCH_FILTER_DEFS = [
  { key: 'division' as const, label: 'Division' },
  { key: 'customer' as const, label: 'Customer' },
  { key: 'poBillingStatus' as const, label: 'PO Billing' },
]

export const BATCH_COL_FILTER_DEFS = [
  { key: 'customer', label: 'Customer', type: 'text' as const },
  { key: 'invoiceAmount', label: 'Invoice Amount', type: 'range' as const },
]

const PIPELINE_STAGES = new Set([
  'all',
  'rate_validated',
  'ops_validated',
  'pod_verified',
  'rfi',
  'ready',
  'invoiced',
  'email_delivery',
  'as',
])

/** Match order to pipeline segment or validation sub-filter */
export function matchesPipelineStage(order: Order, stage: string): boolean {
  if (stage === 'all') return true

  if (order.validationFilter === stage) return true
  if (order.stage === stage) return true

  if (stage === 'rate_validated') {
    return order.stage === 'rate_validated' || order.validationGroup === 'rate_validation'
  }
  if (stage === 'ops_validated') {
    return order.stage === 'ops_validated' || order.validationGroup === 'operation_validation'
  }
  if (stage === 'rate_validation') {
    return order.validationGroup === 'rate_validation' && order.stage !== 'rate_validated'
  }
  if (stage === 'ops_validation') {
    return order.validationGroup === 'operation_validation' && order.stage !== 'ops_validated'
  }

  if (!PIPELINE_STAGES.has(stage)) {
    return order.validationFilter === stage
  }

  return false
}

export function filterBatchOrders(orders: Order[], filters: BatchFilters): Order[] {
  return orders.filter((o) => {
    const { stage, search, searchScope, division, customer, poBillingStatus, quickPod, colFilters } = filters

    if (!matchesPipelineStage(o, stage)) return false

    if (search) {
      const q = search.toLowerCase()
      if (searchScope === 'order' && !o.orderNo.toLowerCase().includes(q)) return false
      if (searchScope === 'po' && !o.poNo.toLowerCase().includes(q)) return false
      if (
        searchScope === 'all' &&
        !o.orderNo.toLowerCase().includes(q) &&
        !o.poNo.toLowerCase().includes(q) &&
        !o.customer.toLowerCase().includes(q)
      )
        return false
    }

    if (division !== 'ALL' && o.division !== division) return false
    if (customer !== 'ALL' && o.customer !== customer) return false
    if (poBillingStatus !== 'ALL' && o.poBillingStatus !== poBillingStatus) return false
    if (quickPod && !o.hasPod) return false

    if (!matchesColFilter(o.customer, colFilters.customer)) return false
    if (!matchesColFilter(o.invoiceAmount, colFilters.invoiceAmount)) return false

    return true
  })
}

export const DIVISIONS = ['ALL', 'Dedicated', 'OTR', 'Regional', 'CHARGER LOGISTICS', 'CHARGER DEDICATED']
export const CUSTOMERS = ['ALL', 'Tenneco', 'TENNECO INC', 'Walmart', 'Amazon', 'Labatt Brewing Co']
export const PO_BILLING_OPTIONS = ['ALL', 'Pending', 'Billed', 'Hold']
