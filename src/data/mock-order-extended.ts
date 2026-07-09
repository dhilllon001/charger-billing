import type { RelatedPORecord, InvoiceHistoryRecord, AccountingSyncRecord, OrderNote, InternalRating } from './models'

export function getRelatedPOs(orderId: string): RelatedPORecord[] {
  return [
    {
      id: 'rp1',
      orderNo: orderId === 'ord-showcase' ? 'L11274836' : 'L11260001',
      poCategory: 'DFM',
      billingStatus: 'Hold',
      poStatus: 'DELIVERED',
      customerPoNo: '03491007044893',
      poNumber: '03491007044893',
      orderStatus: 'Delivered',
      invoiceNo: undefined,
      invoiceTotal: undefined,
    },
    {
      id: 'rp2',
      orderNo: 'L11260102',
      poCategory: 'DFM',
      billingStatus: 'Pending',
      poStatus: 'DELIVERED',
      customerPoNo: '03491007044901',
      poNumber: '03491007044901',
      orderStatus: 'Delivered',
      invoiceNo: 'INV-2026-4412',
      invoiceTotal: 1410,
    },
  ]
}

export function getInvoiceHistory(orderId: string): InvoiceHistoryRecord[] {
  if (orderId === 'ord-showcase') return []
  return [
    {
      id: 'ih1',
      invoiceNo: 'INV-2026-8821',
      invoiceType: 'Standard',
      invoiceStatus: 'INVOICED',
      reason: '—',
      lastUpdatedBy: 'cf_billing_worker',
      lastUpdatedOn: 'Jul 05, 2026 3:12 PM',
    },
  ]
}

export function getAccountingSync(orderId: string): AccountingSyncRecord[] {
  if (orderId === 'ord-showcase') return []
  return [
    {
      id: 'as1',
      invoiceNo: 'INV-2026-8821',
      totalAmount: 1410,
      invoiceDate: 'Jul 05, 2026',
      paymentStatus: 'Open',
      amountDue: 1410,
      poNumber: '03491007044893',
      fromOnAc: '—',
      taxAmount: 0,
      dueAmount: 1410,
      currency: 'USD',
      invoiceDue: 'Aug 04, 2026',
      createdBy: 'Harmandeep Singh',
    },
  ]
}

export function getOrderNotes(_orderId: string): OrderNote[] {
  return []
}

export function getInternalRatings(orderId: string): InternalRating[] {
  return [
    { carrier: 'Charger Logistics', laneScore: orderId === 'ord-showcase' ? 4.2 : 4.5, onTimePct: 96, lastRated: 'Jul 01, 2026' },
    { carrier: 'Partner Carrier', laneScore: 3.8, onTimePct: 91, lastRated: 'Jun 28, 2026' },
  ]
}
