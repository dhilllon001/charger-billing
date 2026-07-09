import type { CustomerConfig, FreightRate } from './models'

export const customerConfigs: CustomerConfig[] = [
  { id: 'cc-1', name: 'NEOVIA LOGISTICS', lanes: 1384, orders: 0 },
  { id: 'cc-2', name: 'K-Flex de México', lanes: 892, orders: 12 },
  { id: 'cc-3', name: 'Amazon Logistics USA', lanes: 654, orders: 28 },
  { id: 'cc-4', name: 'Labatt Brewing Co', lanes: 420, orders: 2209 },
  { id: 'cc-5', name: 'COLGATE-PALMOLIVE CANADA INC.', lanes: 312, orders: 156 },
  { id: 'cc-6', name: 'The Home Depot Mexico', lanes: 245, orders: 89 },
  { id: 'cc-7', name: 'BMW SLP S.A. de C.V.', lanes: 198, orders: 226 },
  { id: 'cc-8', name: 'P&G', lanes: 567, orders: 299 },
]

export const freightRates: FreightRate[] = Array.from({ length: 25 }, (_, i) => ({
  id: `fr-${i + 1}`,
  customerId: customerConfigs[i % customerConfigs.length].id,
  origin: ['L7G (HALTON HE...)', 'L6T (BRAMPTON, ON)', 'M5V (TORONTO, ON)'][i % 3],
  destination: ['L6T (BRAMPTON, ON)', 'L7E (BOLTON, ON)', 'L4W (MISSISSAUGA)'][i % 3],
  type: 'ZIP3',
  currency: 'CAD',
  distance: '1 MILE',
  frtMethod: 'Flat Rate',
  multiProbill: i % 4 === 0,
  gallons: i % 3 === 0 ? 120 : undefined,
  dryVanExp: 30 + (i % 14),
  reeferExp: 45 + (i % 10),
  triAxleExp: 20 + (i % 8),
  heaterExp: 15 + (i % 6),
  updatedBy: 'CHARGER\\veena',
  active: i % 5 !== 0,
}))
