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
  if (orderId === 'ord-showcase') {
    return [
      {
        id: 'ih-showcase-1',
        invoiceNo: 'DRAFT-11432592',
        invoiceType: 'Standard',
        invoiceStatus: 'DRAFT',
        reason: 'PO billing hold',
        lastUpdatedBy: 'cf_billing_worker',
        lastUpdatedOn: 'Jul 09, 2026 11:02 AM',
      },
      {
        id: 'ih-showcase-2',
        invoiceNo: 'INV-2026-7720',
        invoiceType: 'Credit note',
        invoiceStatus: 'VOIDED',
        reason: 'Rate correction — re-billed',
        lastUpdatedBy: 'Harmandeep Singh',
        lastUpdatedOn: 'Jul 06, 2026 9:18 AM',
      },
    ]
  }
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
  if (orderId === 'ord-showcase') {
    return [
      {
        id: 'as-showcase-1',
        invoiceNo: 'DRAFT-11432592',
        totalAmount: 1410,
        invoiceDate: 'Jul 09, 2026',
        paymentStatus: 'Draft',
        amountDue: 1410,
        poNumber: '03491007044893',
        fromOnAc: '—',
        taxAmount: 0,
        dueAmount: 1410,
        currency: 'USD',
        invoiceDue: 'Aug 08, 2026',
        createdBy: 'cf_billing_worker',
      },
    ]
  }
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

export function getOrderNotes(orderId: string): OrderNote[] {
  if (orderId === 'ord-showcase') {
    return [
      {
        id: 'n1',
        text: 'PO billing on hold — waiting for TENNECO AP to release PO 03491007044893.',
        createdBy: 'Harmandeep Singh',
        createdOn: 'Jul 08, 2026 3:40 PM',
      },
      {
        id: 'n2',
        text: 'Lumper receipt verified against POD. Charge approved at $460.',
        createdBy: 'cf_billing_worker',
        createdOn: 'Jul 09, 2026 10:36 AM',
      },
      {
        id: 'n3',
        text: 'Customer confirmed lane rate $950 matches contracted tariff for Lockport → Bluffton.',
        createdBy: 's.mitchell@chargerlogistics.com',
        createdOn: 'Jul 07, 2026 5:10 PM',
      },
    ]
  }
  return [
    {
      id: 'n1',
      text: 'Standard billing note — no exceptions on this load.',
      createdBy: 'cf_billing_worker',
      createdOn: 'Jul 05, 2026 2:00 PM',
    },
  ]
}

export interface OrderInstruction {
  id: string
  type: string
  text: string
  source: string
  updatedOn: string
}

export function getOrderInstructions(orderId: string): OrderInstruction[] {
  if (orderId === 'ord-showcase') {
    return [
      {
        id: 'i1',
        type: 'Driver',
        text: 'DRIVER MUST BRING SECURITY VEST',
        source: 'Customer EDI',
        updatedOn: 'Jul 07, 2026 4:42 PM',
      },
      {
        id: 'i2',
        type: 'Delivery',
        text: 'Receiver: Shipping Dept · Lumper required at delivery.',
        source: 'Operations',
        updatedOn: 'Jul 08, 2026 9:00 AM',
      },
      {
        id: 'i3',
        type: 'Pickup',
        text: 'Check in at guard shack · Dock 12.',
        source: 'Shipper notes',
        updatedOn: 'Jul 08, 2026 8:45 AM',
      },
    ]
  }
  return [
    {
      id: 'i1',
      type: 'General',
      text: 'No special instructions.',
      source: 'System',
      updatedOn: 'Jul 01, 2026 10:00 AM',
    },
  ]
}

export function getInternalRatings(orderId: string): InternalRating[] {
  return [
    { carrier: 'Charger Logistics', laneScore: orderId === 'ord-showcase' ? 4.2 : 4.5, onTimePct: 96, lastRated: 'Jul 01, 2026' },
    { carrier: 'Partner Carrier', laneScore: 3.8, onTimePct: 91, lastRated: 'Jun 28, 2026' },
  ]
}
