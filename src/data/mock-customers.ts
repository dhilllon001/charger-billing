import type { Customer, BillingUser } from './models'

export const billingUsers: BillingUser[] = [
  { id: 'u-001', name: 'Harmandeep Singh', email: 'harmandeep.singh@chargerlogistics.com', group: 'SuperAdmin', customerIds: ['c-001', 'c-002', 'c-003', 'c-004', 'c-005'] },
  { id: 'u-002', name: 'Reena Bhatia', email: 'reena.bhatia@chargerlogistics.com', group: 'SuperAdmin', customerIds: ['c-001', 'c-006', 'c-007'] },
  { id: 'u-003', name: 'Rupinder Gill', email: 'rupinder.gill@chargerlogistics.com', group: 'Admin', customerIds: ['c-008', 'c-009', 'c-010'] },
  { id: 'u-004', name: 'Parveen Kaur', email: 'parveen.kaur@chargerlogistics.com', group: 'Admin', customerIds: ['c-011', 'c-012'] },
  { id: 'u-005', name: 'Vipul Patel', email: 'vipul.patel@chargerlogistics.com', group: 'Billing Users', customerIds: ['c-003', 'c-013', 'c-014'] },
  { id: 'u-006', name: 'Davinder Singh', email: 'davinder.singh@chargerlogistics.com', group: 'Billing Users', customerIds: ['c-015', 'c-016'] },
  { id: 'u-007', name: 'Harsimran Singh', email: 'harsimran.singh@chargerlogistics.com', group: 'Billing Users', customerIds: ['c-017', 'c-018'] },
  { id: 'u-008', name: 'Sandra', email: 'sandra@pearltechnologies.com', group: 'Billing Users', customerIds: ['c-019'] },
  { id: 'u-009', name: 'Samantha', email: 'samantha@pearltechnologies.com', group: 'Billing Users', customerIds: ['c-020'] },
  { id: 'u-010', name: 'Eshna', email: 'eshna@pearltechnologies.com', group: 'Guest', customerIds: ['c-021'] },
  { id: 'u-011', name: 'Ana Padron', email: 'ana.padron@chargerlogistics.com', group: 'Admin', customerIds: ['c-001', 'c-022'] },
  { id: 'u-012', name: 'Michael Torres', email: 'michael.torres@chargerlogistics.com', group: 'Guest', customerIds: [] },
]

const customerNames = [
  'Labatt Brewing Co', 'Abbott Laboratories (CA)', 'Anheuser Busch', 'Amazon Logistics', 'BMW SLP',
  'Bimbo Bakehouse', 'Canada Post', 'Goodyear', 'Riverside Natural Foods', 'Hood Packaging',
  'P&G', 'Volkswagen de México', 'Brose North America', 'Hitachi Astemo Silao', 'Pirelli Neumáticos',
  'Ekaterra Global', 'Hisense USA Corp', 'Natra Chocolate', 'World Courier of Canada', 'Charger',
  'DSV Air and Sea', 'Magna Assembly Systems', 'Farm Fresh Turkey Products', 'Traffic Tech Inc',
  'Canada Tire Corp', 'The Home Depot Mexico', 'XPO NLM–Ford', 'Emballages Netpak', 'DHL Transport Brokerage', 'Rexam Beverage Can Co',
]

export const customers: Customer[] = customerNames.map((name, i) => ({
  id: `c-${String(i + 1).padStart(3, '0')}`,
  name,
  region: ['Canada', 'USA', 'Mexico'][i % 3],
  status: i < 25 ? 'active' : i < 28 ? 'new' : 'disabled',
  assignedUserIds: billingUsers.filter((u) => u.customerIds.includes(`c-${String(i + 1).padStart(3, '0')}`)).map((u) => u.id),
}))

export function getCustomerSegmentCounts() {
  return {
    assigned: customers.filter((c) => c.status === 'active').length,
    new: customers.filter((c) => c.status === 'new').length,
    disabled: customers.filter((c) => c.status === 'disabled').length,
  }
}

export function getGroupCounts() {
  return {
    SuperAdmin: billingUsers.filter((u) => u.group === 'SuperAdmin').length,
    Admin: billingUsers.filter((u) => u.group === 'Admin').length,
    'Billing Users': billingUsers.filter((u) => u.group === 'Billing Users').length,
    Guest: billingUsers.filter((u) => u.group === 'Guest').length,
  }
}
