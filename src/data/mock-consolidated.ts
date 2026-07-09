import type { ConsolidatedBatch } from './models'
import { orders } from './mock-orders'

const labattOrders = orders.filter((o) => o.customer === 'Labatt Brewing Co').map((o) => o.id)
const bmwOrders = orders.filter((o) => o.customer.includes('BMW')).map((o) => o.id)
const pgOrders = orders.filter((o) => o.customer === 'P&G').map((o) => o.id)

export const consolidatedBatches: ConsolidatedBatch[] = [
  { id: 'batch-001', customer: 'Abbott Laboratories Co (Canada)', billToCustomer: 'Abbott Laboratories Co (Canada)', batchName: 'Batch 001', orderIds: orders.slice(0, 11).map((o) => o.id), currency: 'CAD' },
  { id: 'batch-002', customer: 'Arlanxeo Canada', billToCustomer: 'Arlanxeo Canada', batchName: 'Batch 001', orderIds: orders.slice(11, 15).map((o) => o.id), currency: 'CAD' },
  { id: 'batch-003', customer: 'BMW SLP S.A. de C.V.', billToCustomer: 'BMW SLP S.A. de C.V.', batchName: 'Batch 001', orderIds: bmwOrders.length ? bmwOrders : orders.slice(0, 5).map((o) => o.id), currency: 'MXN' },
  { id: 'batch-004', customer: 'BMW SLP (2)', billToCustomer: 'BMW SLP S.A. de C.V.', batchName: 'Batch 002', orderIds: orders.slice(5, 16).map((o) => o.id), currency: 'MXN' },
  { id: 'batch-005', customer: 'Brose North America', billToCustomer: 'Brose North America', batchName: 'Batch 001', orderIds: orders.slice(16, 24).map((o) => o.id), currency: 'CAD' },
  { id: 'batch-006', customer: 'Canada Post Corp', billToCustomer: 'Canada Post Corp', batchName: 'Batch 001', orderIds: orders.slice(24, 33).map((o) => o.id), currency: 'CAD' },
  { id: 'batch-007', customer: 'Charger', billToCustomer: 'Charger Logistics Inc', batchName: 'Batch 001', orderIds: orders.slice(33, 37).map((o) => o.id), currency: 'CAD' },
  { id: 'batch-008', customer: 'Ekaterra Global', billToCustomer: 'Ekaterra Global', batchName: 'Batch 001', orderIds: orders.slice(0, 23).map((o) => o.id), currency: 'CAD' },
  { id: 'batch-009', customer: 'Hisense USA Corp', billToCustomer: 'Hisense USA Corp', batchName: 'Batch 001', orderIds: orders.slice(0, 28).map((o) => o.id), currency: 'USD' },
  { id: 'batch-010', customer: 'Hitachi Astemo Silao', billToCustomer: 'Hitachi Astemo Silao', batchName: 'Batch 001', orderIds: orders.slice(0, 21).map((o) => o.id), currency: 'MXN' },
  { id: 'batch-011', customer: 'Labatt Brewing Co', billToCustomer: 'Labatt Brewing Co', batchName: 'Batch 001', orderIds: labattOrders.length ? labattOrders : orders.slice(0, 20).map((o) => o.id), currency: 'CAD' },
  { id: 'batch-012', customer: 'Natra Chocolate', billToCustomer: 'Natra Chocolate', batchName: 'Batch 001', orderIds: orders.slice(0, 11).map((o) => o.id), currency: 'CAD' },
  { id: 'batch-013', customer: 'P&G', billToCustomer: 'Procter & Gamble', batchName: 'Batch 007', orderIds: pgOrders.length ? pgOrders : orders.slice(0, 10).map((o) => o.id), currency: 'CAD' },
  { id: 'batch-014', customer: 'Pirelli Neumáticos', billToCustomer: 'Pirelli Neumáticos', batchName: 'Batch 001', orderIds: orders.slice(0, 15).map((o) => o.id), currency: 'MXN' },
  { id: 'batch-015', customer: 'Volkswagen de México', billToCustomer: 'Volkswagen de México', batchName: 'Batch 001', orderIds: orders.slice(0, 12).map((o) => o.id), currency: 'MXN' },
  { id: 'batch-016', customer: 'Volkswagen de México (2)', billToCustomer: 'Volkswagen de México', batchName: 'Batch 002', orderIds: orders.slice(12, 24).map((o) => o.id), currency: 'MXN' },
  { id: 'batch-017', customer: 'World Courier of Canada', billToCustomer: 'World Courier of Canada', batchName: 'Batch 001', orderIds: orders.slice(0, 1).map((o) => o.id), currency: 'CAD' },
]
