import type { FuelIndex, RateCard, LaneLocation } from './models'

export const fuelIndices: FuelIndex[] = [
  { id: 'fi-btf', name: 'BTF', trend: 'flat', unit: 'none', history: [] },
  { id: 'fi-doe', name: 'DOE', value: 4.578, unit: '$/gallon', trend: 'down', weeklyDeltaPct: -1.2, history: genHistory(4.578, 12) },
  { id: 'fi-fca-ltl', name: 'FCA LTL (CAD)', value: 29.9, unit: '%', trend: 'up', weeklyDeltaPct: 0.8, history: genHistory(29.9, 12) },
  { id: 'fi-fca-tl2', name: 'FCA TL2 (CAD)', value: 70.4, unit: '%', trend: 'up', weeklyDeltaPct: 1.1, history: genHistory(70.4, 12) },
  { id: 'fi-fca-tl3', name: 'FCA_TL3 (USD)', value: 67, unit: '%', trend: 'down', weeklyDeltaPct: -0.5, history: genHistory(67, 12) },
  { id: 'fi-midwest', name: 'Midwest PADD2', value: 4.458, unit: '$/gallon', trend: 'down', weeklyDeltaPct: -0.9, history: genHistory(4.458, 12) },
  { id: 'fi-mj', name: 'MJ Ervin RACK', value: 140.1, unit: 'cent/liter', trend: 'up', weeklyDeltaPct: 2.3, history: genHistory(140.1, 12) },
  { id: 'fi-national', name: 'National Average', value: 205.8, unit: 'cent/liter', trend: 'up', weeklyDeltaPct: 0.4, history: genHistory(205.8, 12) },
  { id: 'fi-nrc', name: 'Natural Resource Canada', value: 190, unit: '$/gallon', trend: 'down', weeklyDeltaPct: -1.5, history: genHistory(190, 12) },
  { id: 'fi-none', name: 'No index', trend: 'flat', unit: 'none', history: [] },
]

function genHistory(base: number, weeks: number) {
  return Array.from({ length: weeks }, (_, i) => ({
    price: base + (Math.sin(i) * base * 0.02),
    weekBeginning: `2026-${String(Math.max(4, 7 - Math.floor(i / 4))).padStart(2, '0')}-${String((i % 4) * 7 + 1).padStart(2, '0')}`,
    weekEnding: `2026-${String(Math.max(4, 7 - Math.floor(i / 4))).padStart(2, '0')}-${String((i % 4) * 7 + 7).padStart(2, '0')}`,
    updatedBy: 'Harmandeep Singh',
    updatedOn: `2026-07-0${(i % 7) + 1}`,
  }))
}

export const rateCards: RateCard[] = [
  { id: 'rc-001', customer: 'The Home Depot Mexico', origin: 'Atitalaquia, HG', destination: 'Colón, QA', originCountryCode: 'MX', destinationCountryCode: 'MX', laneTypeCode: 'TL_SPOT', cityFrom: 'Atitalaquia', cityTo: 'Colón', equipment: 'Dry_Van', effectiveDate: '2026-06-15', expiryDate: '2026-07-15', updatedBy: 'Reena Bhatia', updatedOn: '2026-06-15' },
  { id: 'rc-002', customer: 'The Home Depot Mexico', origin: 'Heroica Puebla de Zaragoza, PB', destination: 'Colón, QA', originCountryCode: 'MX', destinationCountryCode: 'MX', laneTypeCode: 'TL_SPOT', cityFrom: 'Puebla', cityTo: 'Colón', equipment: 'Dry_Van', effectiveDate: '2026-06-20', expiryDate: '2026-07-18', updatedBy: 'Reena Bhatia', updatedOn: '2026-06-20' },
  { id: 'rc-003', customer: 'BMW SLP S.A. de C.V.', origin: 'San Luis Potosí, SLP', destination: 'Laredo, TX', originCountryCode: 'MX', destinationCountryCode: 'US', laneTypeCode: 'TL_CONTRACT', cityFrom: 'San Luis Potosí', cityTo: 'Laredo', equipment: 'Dry_Van', effectiveDate: '2026-05-01', expiryDate: '2026-07-20', updatedBy: 'Vipul Patel', updatedOn: '2026-05-01' },
]

export const laneLocations: LaneLocation[] = Array.from({ length: 20 }, (_, i) => ({
  id: `ll-${String(i + 1).padStart(3, '0')}`,
  sourceItem: ['Toronto, ON', 'Montreal, QC', 'Chicago, IL', 'Detroit, MI', 'London, ON'][i % 5],
  statusCode: i % 8 === 0 ? 'Inactive' : 'Active',
  aliases: i % 3 === 0 ? [`Alias ${i + 1}`, `Alt ${i + 1}`] : [],
  createdOn: `2025-${String((i % 12) + 1).padStart(2, '0')}-15`,
  createdBy: 'Harmandeep Singh',
  modifiedOn: i % 2 === 0 ? `2026-06-${String((i % 28) + 1).padStart(2, '0')}` : undefined,
  modifiedBy: i % 2 === 0 ? 'Reena Bhatia' : undefined,
}))
