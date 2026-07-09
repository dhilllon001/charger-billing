import { useMemo, useState, useCallback } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, SlidersHorizontal, LayoutGrid, ChevronLeft, ChevronRight, FileText } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Segment } from '@/components/ui/Segment'
import { SearchInput } from '@/components/ui/SearchInput'
import { SelectActionBar } from '@/components/layout/SelectActionBar'
import { FiltersDrawer } from '@/components/layout/FiltersDrawer'
import { AppliedFiltersRow } from '@/components/report/AppliedFiltersRow'
import { SrDataTable } from '@/components/report/SrDataTable'
import {
  selectApplied,
  searchApplied,
  colFiltersApplied,
  countActiveFilters,
} from '@/lib/report/filters'
import { orders, getStageCounts } from '@/data/mock-orders'
import { rateValidationFilters, opsValidationFilters } from '@/data/validation-filters'
import { formatCurrency } from '@/lib/format'
import { useUiStore } from '@/stores/ui-store'
import { cn } from '@/lib/cn'
import type { PipelineStage } from '@/data/models'
import {
  DEFAULT_BATCH_FILTERS,
  BATCH_FILTER_DEFS,
  BATCH_COL_FILTER_DEFS,
  filterBatchOrders,
  PO_BILLING_OPTIONS,
  type BatchFilters,
} from './batch-filters'
import { buildBatchGroupedColumns, batchHoverTitle, batchHoverSubtitle, batchHoverDetails } from '@/lib/batch-grouped-columns'

const stageCounts = getStageCounts()
const PAGE_SIZES = [25, 50, 100]

const segments = [
  { id: 'all', label: 'All', count: stageCounts.all },
  {
    id: 'rate_validated',
    label: 'Rate validated',
    count: stageCounts.rate_validated,
    subItems: rateValidationFilters.map((f) => ({ id: f.id, label: f.label, count: f.count, variant: f.variant })),
  },
  {
    id: 'ops_validated',
    label: 'Ops validated',
    count: stageCounts.ops_validated,
    subItems: opsValidationFilters.map((f) => ({ id: f.id, label: f.label, count: f.count, variant: f.variant })),
  },
  { id: 'pod_verified', label: 'POD Validation', count: stageCounts.pod_verified },
  { id: 'rfi', label: 'RFI', count: stageCounts.rfi },
  { id: 'invoiced', label: 'Invoiced', count: stageCounts.invoiced },
  { id: 'email_delivery', label: 'Email Invoice Delivery', count: stageCounts.email_delivery },
  { id: 'as', label: 'AS', count: stageCounts.as },
]

export function BatchInvoicingPage() {
  const [searchParams] = useSearchParams()
  const initialStage = (searchParams.get('stage') as PipelineStage) || 'all'
  const [filters, setFilters] = useState<BatchFilters>({ ...DEFAULT_BATCH_FILTERS, stage: initialStage })
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(25)
  const navigate = useNavigate()
  const addToast = useUiStore((s) => s.addToast)

  const patch = useCallback((p: Partial<BatchFilters>) => {
    setFilters((prev) => ({ ...prev, ...p }))
    setPage(0)
  }, [])

  const filtered = useMemo(() => filterBatchOrders(orders, filters), [filters])
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paged = useMemo(
    () => filtered.slice(page * pageSize, page * pageSize + pageSize),
    [filtered, page, pageSize]
  )

  const appliedFilters = useMemo(
    () => [
      ...selectApplied(filters, BATCH_FILTER_DEFS, patch),
      ...searchApplied(filters.search, () => patch({ search: '' })),
      ...(filters.quickPod
        ? [{ key: 'quickPod', label: 'Quick POD', value: 'On', onClear: () => patch({ quickPod: false }) }]
        : []),
      ...colFiltersApplied(filters.colFilters, BATCH_COL_FILTER_DEFS, (next) => patch({ colFilters: next })),
    ],
    [filters, patch]
  )

  const activeCount = useMemo(
    () =>
      countActiveFilters(
        filters as unknown as Record<string, unknown>,
        ['division', 'customer', 'poBillingStatus', 'equipment'],
        filters.colFilters
      ) +
      (filters.quickPod ? 1 : 0) +
      (filters.dateFrom ? 1 : 0) +
      (filters.dateTo ? 1 : 0),
    [filters]
  )

  const resetFilters = () => {
    setFilters({ ...DEFAULT_BATCH_FILTERS, stage: filters.stage })
    setPage(0)
  }

  const selectedTotal = filtered.filter((o) => selectedIds.has(o.id)).reduce((s, o) => s + o.invoiceAmount, 0)

  const toggleRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = (ids: string[]) => {
    setSelectedIds((prev) => {
      const allOn = ids.every((id) => prev.has(id))
      if (allOn) return new Set()
      return new Set(ids)
    })
  }

  const groupedColumns = useMemo(() => buildBatchGroupedColumns(), [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('batch-workspace', selectedIds.size > 0 && 'batch-workspace--has-selection')}
      style={{ height: '100%' }}
    >
      <div className="batch-panel">
        <section className="batch-section batch-section--pipeline">
          <div className="batch-panel__pipeline batch-panel__pipeline--dropdown">
            <Segment
              items={segments}
              value={filters.stage}
              onChange={(stage) => patch({ stage })}
              className="sr-segment--apple"
            />
          </div>
          <div className="batch-panel__top-actions">
            <Button
              variant="ghost"
              size="sm"
              className="batch-btn-ghost"
              onClick={() => addToast('AI validated 735 orders — 58 flagged for review')}
            >
              <Sparkles size={14} strokeWidth={1.7} className="batch-btn-validate__icon" />
              <span className="hidden sm:inline">Auto-validate all</span>
            </Button>
            <Link to="/consolidated">
              <Button variant="ghost" size="sm" className="batch-btn-ghost">Consolidated Invoicing</Button>
            </Link>
          </div>
        </section>

        <section className="batch-section batch-section--toolbar">
          <div className="batch-toolbar">
            <div className="batch-toolbar__left">
              <SearchInput
                value={filters.search}
                onChange={(search) => patch({ search })}
                placeholder="Filter by keyword…"
                className="batch-panel__search"
                scope={{
                  value: filters.searchScope,
                  onChange: (searchScope) => patch({ searchScope: searchScope as BatchFilters['searchScope'] }),
                  options: [
                    { value: 'order', label: 'Order #' },
                    { value: 'po', label: 'PO #' },
                    { value: 'all', label: 'All' },
                  ],
                }}
              />
              <div className="batch-toolbar__dates">
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => patch({ dateFrom: e.target.value })}
                  className="batch-toolbar-date"
                  title="From"
                />
                <span className="batch-toolbar-date-sep">to</span>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => patch({ dateTo: e.target.value })}
                  className="batch-toolbar-date"
                  title="To"
                />
              </div>
            </div>
            <div className="batch-toolbar__right">
              <button
                type="button"
                className={`batch-toolbar-chip${filters.quickPod ? ' is-active' : ''}`}
                onClick={() => patch({ quickPod: !filters.quickPod })}
              >
                Quick POD
              </button>
              <select
                value={filters.poBillingStatus}
                onChange={(e) => patch({ poBillingStatus: e.target.value })}
                className="batch-toolbar-select"
              >
                {PO_BILLING_OPTIONS.map((o) => (
                  <option key={o} value={o}>{o === 'ALL' ? 'Any billing' : o}</option>
                ))}
              </select>
              <button type="button" className="batch-toolbar-chip" onClick={() => setFiltersOpen(true)}>
                <SlidersHorizontal size={14} strokeWidth={1.7} />
                Filters
                {activeCount > 0 && <span className="batch-toolbar-badge">{activeCount}</span>}
              </button>
              <button type="button" className="batch-toolbar-chip hidden lg:inline-flex">
                <LayoutGrid size={14} strokeWidth={1.7} />
                Layouts
              </button>
              <Button
                size="sm"
                variant="ghost"
                className="batch-btn-generate"
                disabled={selectedIds.size === 0}
                onClick={() => addToast(`Generating invoice for ${selectedIds.size} orders…`)}
              >
                <FileText size={15} strokeWidth={2} />
                Generate Invoice
              </Button>
            </div>
          </div>
        </section>

        {appliedFilters.length > 0 && (
          <div className="batch-panel__applied">
            <AppliedFiltersRow chips={appliedFilters} onClearAll={resetFilters} />
          </div>
        )}

        <section className="batch-table-shell">
          <div className="batch-panel__table batch-panel__table--grouped">
            <SrDataTable
              rows={paged}
              columns={groupedColumns}
              colFilters={filters.colFilters}
              onColFilterChange={(colFilters) => patch({ colFilters })}
              selectedIds={selectedIds}
              onToggleRow={toggleRow}
              onToggleAll={toggleAll}
              onRowClick={(row) => navigate(`/orders/${row.id}`)}
              hoverTitle={batchHoverTitle}
              hoverSubtitle={batchHoverSubtitle}
              hoverDetails={batchHoverDetails}
              density="comfortable"
              wrapClassName="sr-table-wrap--flush"
              tableClassName="sr-table--batch"
              emptyTitle="No orders match these filters"
              emptyHint="Try a different pipeline stage or clear filters"
              emptyAction={
                <Button variant="ghost" size="sm" onClick={resetFilters}>Clear filters</Button>
              }
              maxHeight="none"
              responsive
              mobileCard={(row) => ({
                title: row.orderNo,
                subtitle: row.customer,
                amount: formatCurrency(row.invoiceAmount, row.currency),
                meta: (
                  <div className="batch-mobile-meta">
                    <span>{row.pickupCity} → {row.deliveryCity}</span>
                  </div>
                ),
              })}
            />
          </div>
        </section>

        <section className="batch-section batch-section--footer">
          <span className="batch-panel__footer-total">
            Total: <strong>{filtered.length.toLocaleString()}</strong>
          </span>
          <div className="batch-panel__footer-pages">
            <label className="batch-panel__footer-size">
              Items per page
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0) }}
              >
                {PAGE_SIZES.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
            <span className="batch-panel__footer-range">
              {filtered.length === 0 ? '0' : `${page + 1}`} of {pageCount}
            </span>
            <button type="button" className="batch-page-btn" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft size={16} strokeWidth={2} />
            </button>
            <button type="button" className="batch-page-btn" disabled={page >= pageCount - 1} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight size={16} strokeWidth={2} />
            </button>
          </div>
        </section>
      </div>

      <SelectActionBar
        count={selectedIds.size}
        total={selectedTotal}
        onClear={() => setSelectedIds(new Set())}
        onPreview={() => addToast('Opening draft preview…')}
        onGenerate={() => setSelectedIds(new Set())}
      />
      <FiltersDrawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={{
          poBillingStatus: filters.poBillingStatus,
          customer: filters.customer,
          division: filters.division,
          equipment: filters.equipment,
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo,
        }}
        onPatch={patch}
        onClear={resetFilters}
      />
    </motion.div>
  )
}
