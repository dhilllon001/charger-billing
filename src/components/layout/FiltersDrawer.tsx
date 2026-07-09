import { Drawer } from '@/components/ui/Drawer'
import { Button } from '@/components/ui/Button'
import { FilterChip } from '@/components/ui/FilterChip'
import type { BatchFilters } from '@/features/batch-invoicing/batch-filters'
import {
  DIVISIONS,
  CUSTOMERS,
  PO_BILLING_OPTIONS,
  EQUIPMENT_OPTIONS,
} from '@/features/batch-invoicing/batch-filters'

interface FiltersDrawerProps {
  open: boolean
  onClose: () => void
  filters: Pick<BatchFilters, 'poBillingStatus' | 'customer' | 'division' | 'equipment' | 'dateFrom' | 'dateTo'>
  onPatch: (patch: Partial<FiltersDrawerProps['filters']>) => void
  onClear: () => void
}

export function FiltersDrawer({ open, onClose, filters, onPatch, onClear }: FiltersDrawerProps) {
  return (
    <Drawer open={open} onClose={onClose} title="All filters" width={360}>
      <div className="space-y-6 p-5">
        <section>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.05em] text-ink-3">PO Billing Status</p>
          <div className="flex flex-wrap gap-2">
            {PO_BILLING_OPTIONS.filter((o) => o !== 'ALL').map((status) => (
              <FilterChip
                key={status}
                label={status}
                active={filters.poBillingStatus === status}
                onClick={() => onPatch({ poBillingStatus: filters.poBillingStatus === status ? 'ALL' : status })}
              />
            ))}
          </div>
        </section>

        <section>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.05em] text-ink-3">Customer</p>
          <select
            value={filters.customer}
            onChange={(e) => onPatch({ customer: e.target.value })}
            className="w-full rounded-[10px] border border-line px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-accent-soft"
          >
            {CUSTOMERS.map((c) => (
              <option key={c} value={c}>{c === 'ALL' ? 'Any customer' : c}</option>
            ))}
          </select>
        </section>

        <section>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.05em] text-ink-3">Division</p>
          <div className="flex flex-wrap gap-2">
            {DIVISIONS.filter((d) => d !== 'ALL').map((division) => (
              <FilterChip
                key={division}
                label={division}
                active={filters.division === division}
                onClick={() => onPatch({ division: filters.division === division ? 'ALL' : division })}
              />
            ))}
          </div>
        </section>

        <section>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.05em] text-ink-3">Delivery date range</p>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => onPatch({ dateFrom: e.target.value })}
              className="rounded-[10px] border border-line px-3 py-2 text-[13px]"
            />
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => onPatch({ dateTo: e.target.value })}
              className="rounded-[10px] border border-line px-3 py-2 text-[13px]"
            />
          </div>
        </section>

        <section>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.05em] text-ink-3">Equipment</p>
          <div className="flex flex-wrap gap-2">
            {EQUIPMENT_OPTIONS.filter((e) => e !== 'ALL').map((eq) => (
              <FilterChip
                key={eq}
                label={eq}
                active={filters.equipment === eq}
                onClick={() => onPatch({ equipment: filters.equipment === eq ? 'ALL' : eq })}
              />
            ))}
          </div>
        </section>

        <div className="flex gap-2 pt-4">
          <Button variant="ghost" className="flex-1" onClick={() => { onClear(); onClose() }}>Clear all</Button>
          <Button className="flex-1" onClick={onClose}>Apply filters</Button>
        </div>
      </div>
    </Drawer>
  )
}
