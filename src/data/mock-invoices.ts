import type { Invoice } from './models'

const customers = ['Labatt Brewing Co', 'P&G', 'BMW SLP S.A. de C.V.', 'Canada Post Corp', 'Abbott Laboratories Co (Canada)', 'Volkswagen de México', 'Brose North America', 'Hitachi Astemo Silao']
const types: Invoice['invoiceType'][] = ['Standard', 'Consolidated', 'Quick POD', 'Credit note']
const deliveryStatuses: Invoice['deliveryStatus'][] = ['emailed_read', 'sent_unread', 'not_sent', 'uploaded']
const paymentStatuses: Invoice['paymentStatus'][] = ['open', 'paid', 'overdue', 'draft', 'applied']

export const invoices: Invoice[] = Array.from({ length: 35 }, (_, i) => {
  const isCredit = i % 11 === 0
  const isConsolidated = i % 7 === 0 && !isCredit
  const total = isCredit ? -(800 + i * 320) : 2500 + i * 1840
  const paymentStatus = i % 6 === 0 ? 'overdue' : paymentStatuses[i % paymentStatuses.length]

  return {
    id: `inv-${String(i + 1).padStart(4, '0')}`,
    invoiceNo: `INV-2026-${String(400 + i).padStart(4, '0')}`,
    currency: i % 5 === 0 ? 'USD' : i % 8 === 0 ? 'MXN' : 'CAD',
    customer: customers[i % customers.length],
    billCustomerName: customers[i % customers.length],
    divName: ['East', 'West', 'Central'][i % 3],
    orderNo: isConsolidated ? undefined : `CL-${2025000 + i}`,
    consolidatedOrderCount: isConsolidated ? 5 + (i % 20) : undefined,
    invoiceType: isCredit ? 'Credit note' : isConsolidated ? 'Consolidated' : types[i % 3],
    totalOrders: isConsolidated ? 5 + (i % 20) : 1,
    deliveryDate: `2026-06-${String((i % 28) + 1).padStart(2, '0')}`,
    poNo: `PO-${77000 + i}`,
    invoicedDate: `2026-07-${String((i % 8) + 1).padStart(2, '0')}`,
    invoiceDue: `2026-07-${String((i % 20) + 15).padStart(2, '0')}`,
    total,
    adjustedTotal: i % 4 === 0 ? total * 0.98 : undefined,
    invoicedBy: ['Harmandeep Singh', 'Reena Bhatia', 'Rupinder Gill'][i % 3],
    deliveryMethod: ['Email', 'Upload', 'None'][i % 3] as Invoice['deliveryMethod'],
    deliveryStatus: deliveryStatuses[i % deliveryStatuses.length],
    paymentStatus,
    overdueDays: paymentStatus === 'overdue' ? 5 + (i % 40) : undefined,
  }
})

export function getInvoiceSegmentCounts() {
  return {
    all: invoices.length,
    sent: invoices.filter((i) => i.deliveryStatus === 'emailed_read' || i.deliveryStatus === 'sent_unread').length,
    not_sent: invoices.filter((i) => i.deliveryStatus === 'not_sent').length,
    overdue: invoices.filter((i) => i.paymentStatus === 'overdue').length,
    credits: invoices.filter((i) => i.invoiceType === 'Credit note').length,
  }
}
