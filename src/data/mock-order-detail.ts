import type { OrderAdjuster, AuditEntry } from './models'

export const defaultAdjuster: OrderAdjuster = {
  name: 'Sarah Mitchell',
  phone: '+1 (905) 555-0142',
  email: 's.mitchell@chargerlogistics.com',
  region: 'Midwest · IL / IN',
  lastContact: 'Jul 08, 2026 2:15 PM',
  openClaims: 0,
  status: 'Active',
  notes: 'No open disputes. Last rate review completed.',
  adjustments: [
    { date: 'Jul 07, 2026', type: 'Rate review', amount: 0, note: 'Freight rate confirmed at $950' },
    { date: 'Jul 09, 2026', type: 'Accessorial', amount: 460, note: 'Lumper charge added from POD' },
  ],
}

export const defaultAuditLog: AuditEntry[] = [
  { id: 'a1', action: 'Rate validation', user: 'cf_billing_worker', timestamp: 'Jul 07, 2026 4:42 PM', detail: '1 check shows warning', status: 'warn' },
  { id: 'a2', action: 'Ops validation', user: 'system', timestamp: 'Jul 08, 2026 9:20 AM', detail: '14 of 14 checks passed', status: 'pass' },
  { id: 'a3', action: 'POD received', user: 'uipathnotification@chargerlogistics.com', timestamp: 'Jul 09, 2026 10:33 AM', detail: 'POD indexed · Lumper verified', status: 'pass' },
  { id: 'a4', action: 'Charge added', user: 'cf_billing_worker', timestamp: 'Jul 09, 2026 10:35 AM', detail: 'LUMPER $460.00', status: 'pass' },
  { id: 'a5', action: 'Audit queue', user: 'Harmandeep Singh', timestamp: 'Jul 09, 2026 11:00 AM', detail: 'Pending billing review', status: 'warn' },
]

export function getOrderAdjuster(orderId: string): OrderAdjuster {
  return { ...defaultAdjuster, openClaims: orderId === 'ord-showcase' ? 0 : (orderId.charCodeAt(4) % 3) }
}

export function getOrderAuditLog(_orderId: string): AuditEntry[] {
  return defaultAuditLog
}
