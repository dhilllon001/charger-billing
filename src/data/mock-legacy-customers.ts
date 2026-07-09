import type { Customer } from './models'
import { billingUsers } from './mock-customers'

const legacyCustomerNames = [
  '#', 'RIVERSIDE NATURAL FOODS LTD', '10 Wheels Logistics LP', 'Polar Pak c/o User Freight', 'SCHREIBER MEXICO SA DE CV (TS)',
  'ACTIVE AERO GROUP-CGGA', 'A. LASSONDE INC', 'ADM LOGISTICS INC', 'AMAZON LOGISTICS', 'ANHEUSER BUSCH',
  'Abbott Laboratories (CA)', 'BLUE GRACE GROUP', 'Bimbo Bakeries Inc.', 'Barcel USA LLC', 'Labatt Brewing Co',
  'BMW SLP', 'Canada Post', 'COLGATE-PALMOLIVE CANADA INC.', 'Goodyear', 'Hood Packaging',
  'KELLANOVA USA LLC (DRY)', 'KELLANOVA USA LLC (REEFER)', 'NESTLE CANADA', 'NESTLE MEXICO SA DE CV', 'P&G',
  'TENNECO INC', 'Volkswagen de México', 'The Home Depot Mexico', 'DOLLAR TREE', 'NEOVIA LOGISTICS',
]

export const legacyCustomers: Customer[] = legacyCustomerNames.map((name, i) => ({
  id: `lc-${String(i + 1).padStart(3, '0')}`,
  name: name === '#' ? '10 Wheels Logistics LP' : name,
  region: ['Canada', 'USA', 'Mexico'][i % 3],
  status: i < 25 ? 'active' : i < 28 ? 'new' : 'disabled',
  assignedUserIds: billingUsers.slice(0, (i % 4) + 1).map((u) => u.id),
}))

export const customerSegmentCounts = {
  assigned: 4165,
  new: 0,
  disabled: 171,
}

export const userCustomerAssignments: Record<string, string[]> = {
  'u-001': ['Amenity Services', 'Andrew & Williamson Inc.', 'ANHEUSER BUSCH', 'KELLANOVA USA LLC (DRY)', 'KELLANOVA USA LLC (REEFER)', 'NESTLE CANADA', 'NESTLE MEXICO SA DE CV'],
  'u-002': ['Abbott Laboratories (CA)', 'Labatt Brewing Co', 'P&G'],
  'u-009': ['Traffic Tech Inc', 'Canada Tire Corp', 'DSV Air and Sea'],
}
