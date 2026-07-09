import { Drawer } from '@/components/ui/Drawer'
import { Button } from '@/components/ui/Button'
import { FilterChip } from '@/components/ui/FilterChip'

interface FiltersDrawerProps {
  open: boolean
  onClose: () => void
  onApply: () => void
  onClear: () => void
}

export function FiltersDrawer({ open, onClose, onApply, onClear }: FiltersDrawerProps) {
  return (
    <Drawer open={open} onClose={onClose} title="All filters" width={360}>
      <div className="space-y-6 p-5">
        <section>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.05em] text-ink-3">PO Billing Status</p>
          <div className="flex flex-wrap gap-2">
            <FilterChip label="Pending" active />
            <FilterChip label="Billed" />
            <FilterChip label="Hold" />
          </div>
        </section>
        <section>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.05em] text-ink-3">Customer</p>
          <input placeholder="Search customer…" className="w-full rounded-[10px] border border-line px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-accent-soft" />
        </section>
        <section>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.05em] text-ink-3">Division</p>
          <div className="flex flex-wrap gap-2">
            <FilterChip label="CHARGER LOGISTICS" />
            <FilterChip label="CHARGER DEDICATED" />
            <FilterChip label="CHARGER GLOBAL" />
          </div>
        </section>
        <section>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.05em] text-ink-3">Delivery date range</p>
          <div className="grid grid-cols-2 gap-2">
            <input type="date" className="rounded-[10px] border border-line px-3 py-2 text-[13px]" />
            <input type="date" className="rounded-[10px] border border-line px-3 py-2 text-[13px]" />
          </div>
        </section>
        <section>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.05em] text-ink-3">Equipment</p>
          <div className="flex flex-wrap gap-2">
            {['Dry Van', 'FTL', 'Reefer', 'LTL'].map((e) => <FilterChip key={e} label={e} />)}
          </div>
        </section>
        <div className="flex gap-2 pt-4">
          <Button variant="ghost" className="flex-1" onClick={() => { onClear(); onClose() }}>Clear all</Button>
          <Button className="flex-1" onClick={() => { onApply(); onClose() }}>Apply filters</Button>
        </div>
      </div>
    </Drawer>
  )
}
