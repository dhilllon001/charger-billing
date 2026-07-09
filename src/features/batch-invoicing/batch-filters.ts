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

const STAGE_KEYS = ['rate_validated', 'ops_validated', 'pod_verified', 'rfi', 'invoiced', 'email_delivery', 'as', 'all']

export function filterBatchOrders(orders: Order[], filters: BatchFilters): Order[] {
  return orders.filter((o) => {
    const { stage, search, searchScope, division, customer, poBillingStatus, quickPod, colFilters } = filters

    if (stage !== 'all') {
      const stageMatch = o.stage === stage || o.validationFilter === stage
      if (!stageMatch) {
        if (!STAGE_KEYS.includes(stage)) {
          if (o.validationFilter !== stage) return false
        } else if (o.stage !== stage && !o.validationFilter) return false
      }
    }

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

export const DIVISIONS = ['ALL', 'Dedicated', 'OTR', 'Regional']
export const CUSTOMERS = ['ALL', 'Tenneco', 'Walmart', 'Amazon']
export const PO_BILLING_OPTIONS = ['ALL', 'Pending', 'Billed', 'Hold']
