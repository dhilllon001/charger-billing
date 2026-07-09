import type { ActivityItem } from './models'

export const activities: ActivityItem[] = [
  { id: 'a-1', user: 'Harmandeep Singh', action: 'generated 24 invoices for Labatt Brewing Co', timestamp: '2026-07-09T09:15:00', color: '#1FA85B' },
  { id: 'a-2', user: 'Reena Bhatia', action: 'updated fuel index DOE to $4.578/gal', timestamp: '2026-07-09T08:42:00', color: '#0071E3' },
  { id: 'a-3', user: 'AI Copilot', action: 'auto-validated 92 orders — 8 flagged for review', timestamp: '2026-07-09T08:30:00', color: '#6E5BE8' },
  { id: 'a-4', user: 'Rupinder Gill', action: 'sent invoice INV-2026-0418 to P&G', timestamp: '2026-07-08T16:20:00', color: '#1FA85B' },
  { id: 'a-5', user: 'Vipul Patel', action: 'renewed rate card for Home Depot Mexico', timestamp: '2026-07-08T14:05:00', color: '#C77400' },
  { id: 'a-6', user: 'Parveen Kaur', action: 'created delivery rule for Canada Tire Corp', timestamp: '2026-07-08T11:30:00', color: '#0071E3' },
  { id: 'a-7', user: 'AI Copilot', action: 'prevented duplicate invoice for CL-2026042', timestamp: '2026-07-07T17:45:00', color: '#6E5BE8' },
  { id: 'a-8', user: 'Davinder Singh', action: 'exported invoiced report (last 14 days)', timestamp: '2026-07-07T15:00:00', color: '#515154' },
]

export const weeklyInvoiced = [
  { week: 'May 17', amount: 285000 },
  { week: 'May 24', amount: 312000 },
  { week: 'May 31', amount: 298000 },
  { week: 'Jun 07', amount: 345000 },
  { week: 'Jun 14', amount: 378000 },
  { week: 'Jun 21', amount: 356000 },
  { week: 'Jun 28', amount: 402000 },
  { week: 'Jul 05', amount: 428500 },
]
