export type PipelineStage =
  | 'all'
  | 'rate_validated'
  | 'ops_validated'
  | 'pod_verified'
  | 'rfi'
  | 'ready'
  | 'invoiced'
  | 'email_delivery'
  | 'as'

export type OrderStatus = 'ready' | 'needs_review' | 'blocked' | 'in_validation'

export type AiCheck = {
  state: 'auto_validated' | 'rate_variance' | 'pod_missing' | 'awaiting_ops'
  detail?: string
  confidence?: number
}

export interface Order {
  id: string
  orderNo: string
  poNo: string
  customer: string
  billToCustomer: string
  division: string
  poCategory: string
  poBillingStatus: 'Pending' | 'Billed' | 'Hold'
  orderDate: string
  pickUpDate: string
  deliveryDate: string
  pickupLocation: string
  pickupCity: string
  pickupState: string
  deliveryLocation: string
  deliveryCity: string
  deliveryState: string
  callerName: string
  invoiceAmount: number
  invoiceAvgCount: string
  reasonCode?: string
  invoiceStatus: string
  audited: boolean
  draftInvoice: boolean
  draftInvoiceNo?: string
  status: OrderStatus
  invoiceDue?: string
  equipment: 'FTL' | 'LTL' | 'Reefer' | 'Dry Van'
  stage: PipelineStage
  aiCheck: AiCheck
}

export interface ConsolidatedBatch {
  id: string
  customer: string
  billToCustomer: string
  batchName: string
  orderIds: string[]
  currency: 'CAD' | 'USD' | 'MXN'
}

export interface Invoice {
  id: string
  invoiceNo: string
  currency: 'CAD' | 'USD' | 'MXN'
  customer: string
  billCustomerName: string
  divName: string
  orderNo?: string
  consolidatedOrderCount?: number
  invoiceType: 'Standard' | 'Consolidated' | 'Quick POD' | 'Credit note'
  totalOrders: number
  deliveryDate?: string
  poNo?: string
  invoicedDate: string
  invoiceDue?: string
  total: number
  adjustedTotal?: number
  invoicedBy: string
  deliveryMethod: 'Email' | 'Upload' | 'None'
  deliveryStatus: 'emailed_read' | 'sent_unread' | 'not_sent' | 'uploaded'
  paymentStatus: 'open' | 'paid' | 'overdue' | 'draft' | 'applied'
  overdueDays?: number
}

export interface EmailRule {
  id: string
  billingCustomer: string
  billingAddress: string
  to: string[]
  contact?: string
  toLocationWise?: string
  sendVia: 'Email' | 'Upload' | 'Do not send'
  frequency: 'Daily' | 'Weekly' | 'Monthly'
  sendOnDay?: string
  attachment: 'Single attachment in one email' | 'One email per invoice'
  readReceipt: boolean
  deliverReceipt: boolean
  sendLogo: boolean
  pdfNameEqualSubject: boolean
  pdfNameHasCustomer: boolean
  note?: string
  active: boolean
  modifiedBy: string
  modifiedOn: string
}

export interface FuelIndex {
  id: string
  name: string
  value?: number
  unit?: '$/gallon' | '%' | 'cent/liter' | 'none'
  trend: 'up' | 'down' | 'flat'
  weeklyDeltaPct?: number
  history: {
    price: number
    weekBeginning: string
    weekEnding: string
    updatedBy: string
    updatedOn: string
  }[]
}

export interface RateCard {
  id: string
  customer: string
  origin: string
  destination: string
  originCountryCode: string
  destinationCountryCode: string
  laneTypeCode: string
  cityFrom: string
  cityTo: string
  equipment: string
  effectiveDate: string
  expiryDate: string
  updatedBy?: string
  updatedOn?: string
}

export interface LaneLocation {
  id: string
  sourceItem: string
  statusCode: 'Active' | 'Inactive'
  aliases: string[]
  createdOn: string
  createdBy: string
  modifiedOn?: string
  modifiedBy?: string
}

export interface Customer {
  id: string
  name: string
  region: string
  status: 'active' | 'new' | 'disabled'
  assignedUserIds: string[]
}

export interface BillingUser {
  id: string
  name: string
  email: string
  group: 'SuperAdmin' | 'Admin' | 'Billing Users' | 'Guest'
  customerIds: string[]
}

export interface ActivityItem {
  id: string
  user: string
  action: string
  timestamp: string
  color: string
}

export interface DashboardKpi {
  label: string
  value: string
  delta: string
  deltaType: 'up' | 'down' | 'neutral'
  icon: string
}
