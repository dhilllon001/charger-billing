import { useMemo, useState, useCallback } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Segment } from '@/components/ui/Segment'
import { SearchInput } from '@/components/ui/SearchInput'
import { WorkflowStageBadge } from '@/components/ui/WorkflowStepper'
import { PageHeader } from '@/components/layout/PageHeader'
import { SelectActionBar } from '@/components/layout/SelectActionBar'
import { FiltersDrawer } from '@/components/layout/FiltersDrawer'
import { ReportFilterStrip } from '@/components/report/ReportFilterStrip'
import { AppliedFiltersRow } from '@/components/report/AppliedFiltersRow'
import { SrDataTable } from '@/components/report/SrDataTable'
import { RowQuickActions } from '@/components/report/RowQuickActions'
import {
  selectApplied,
  searchApplied,
  colFiltersApplied,
  countActiveFilters,
} from '@/lib/report/filters'
import { orders, getStageCounts } from '@/data/mock-orders'
import { rateValidationFilters, opsValidationFilters } from '@/data/validation-filters'
import { formatCurrency, formatDate } from '@/lib/format'
import { useUiStore } from '@/stores/ui-store'
import type { Order, PipelineStage } from '@/data/models'
import {
  DEFAULT_BATCH_FILTERS,
  BATCH_FILTER_DEFS,
  BATCH_COL_FILTER_DEFS,
  filterBatchOrders,
  DIVISIONS,
  CUSTOMERS,
  PO_BILLING_OPTIONS,
  type BatchFilters,
} from './batch-filters'

const stageCounts = getStageCounts()

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
  { id: 'email_delivery', label: 'Email delivery', count: stageCounts.email_delivery },
  { id: 'as', label: 'AS', count: stageCounts.as },
]

export function BatchInvoicingPage() {
  const [searchParams] = useSearchParams()
  const initialStage = (searchParams.get('stage') as PipelineStage) || 'all'
  const [filters, setFilters] = useState<BatchFilters>({ ...DEFAULT_BATCH_FILTERS, stage: initialStage })
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const navigate = useNavigate()
  const addToast = useUiStore((s) => s.addToast)

  const patch = useCallback((p: Partial<BatchFilters>) => {
    setFilters((prev) => ({ ...prev, ...p }))
  }, [])

  const filtered = useMemo(() => filterBatchOrders(orders, filters), [filters])
  const invoiceTotal = useMemo(() => filtered.reduce((s, o) => s + o.invoiceAmount, 0), [filtered])

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
        ['division', 'customer', 'poBillingStatus'],
        filters.colFilters
      ) + (filters.quickPod ? 1 : 0),
    [filters]
  )

  const resetFilters = () => {
    setFilters({ ...DEFAULT_BATCH_FILTERS, stage: filters.stage })
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

  const cycleSelect = (key: 'division' | 'customer' | 'poBillingStatus', options: string[]) => {
    const idx = options.indexOf(filters[key])
    const next = options[(idx + 1) % options.length]
    patch({ [key]: next })
  }

  const filterStripItems = [
    {
      key: 'quickPod',
      label: 'Quick POD',
      active: filters.quickPod,
      onClick: () => patch({ quickPod: !filters.quickPod }),
      onClear: () => patch({ quickPod: false }),
    },
    {
      key: 'poBilling',
      label: filters.poBillingStatus === 'ALL' ? 'Billing: Any' : filters.poBillingStatus,
      active: filters.poBillingStatus !== 'ALL',
      onClick: () => cycleSelect('poBillingStatus', PO_BILLING_OPTIONS),
      onClear: () => patch({ poBillingStatus: 'ALL' }),
    },
    {
      key: 'customer',
      label: filters.customer === 'ALL' ? 'Customer: Any' : filters.customer,
      active: filters.customer !== 'ALL',
      onClick: () => cycleSelect('customer', CUSTOMERS),
      onClear: () => patch({ customer: 'ALL' }),
    },
    {
      key: 'division',
      label: filters.division === 'ALL' ? 'Division: Any' : filters.division,
      active: filters.division !== 'ALL',
      onClick: () => cycleSelect('division', DIVISIONS),
      onClear: () => patch({ division: 'ALL' }),
    },
    { key: 'allFilters', label: 'More filters', onClick: () => setFiltersOpen(true) },
  ]

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="batch-workspace">
      <div>
        <PageHeader
          title="Batch Invoicing"
          subtitle="Review orders across rate, ops, and POD validation — generate invoices when ready."
          actions={
            <>
              <Button variant="ai" size="sm" onClick={() => addToast('AI validated 735 orders — 58 flagged for review')}>
                <Sparkles size={14} strokeWidth={1.7} />
                <span className="hidden sm:inline">Auto-validate all (AI)</span>
                <span className="sm:hidden">AI Validate</span>
              </Button>
              <Link to="/consolidated">
                <Button variant="ghost" size="sm">Consolidated view</Button>
              </Link>
            </>
          }
        />
        <div className="batch-header-meta">
          <span className="batch-header-meta__item">
            Pipeline <strong>{stageCounts.all.toLocaleString()}</strong>
          </span>
          <span className="batch-header-meta__sep" />
          <span className="batch-header-meta__item">
            Showing <strong>{filtered.length.toLocaleString()}</strong>
          </span>
          <span className="batch-header-meta__sep" />
          <span className="batch-header-meta__item">
            Selected <strong>{selectedIds.size.toLocaleString()}</strong>
          </span>
          <span className="batch-header-meta__sep" />
          <span className="batch-header-meta__item">
            Total <strong>{formatCurrency(invoiceTotal)}</strong>
          </span>
        </div>
      </div>

      <div className="batch-panel">
        <div className="batch-panel__pipeline batch-panel__pipeline--dropdown">
          <Segment
            items={segments}
            value={filters.stage}
            onChange={(stage) => patch({ stage })}
            className="min-w-max !border-0 !bg-transparent !p-0"
          />
        </div>

        <div className="batch-panel__controls">
          <SearchInput
            value={filters.search}
            onChange={(search) => patch({ search })}
            placeholder="Search order, PO or customer…"
            className="batch-panel__search w-full"
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
          <div className="batch-panel__filters">
            <ReportFilterStrip items={filterStripItems} activeCount={activeCount} onReset={resetFilters} />
          </div>
        </div>

        {appliedFilters.length > 0 && (
          <div className="batch-panel__applied">
            <AppliedFiltersRow chips={appliedFilters} onClearAll={resetFilters} />
          </div>
        )}

        <div className="batch-panel__table">
          <SrDataTable
            rows={filtered}
            responsive
            mobileCard={(row) => ({
              title: row.orderNo,
              subtitle: row.customer,
              amount: formatCurrency(row.invoiceAmount),
              meta: (
                <>
                  {row.workflow && <WorkflowStageBadge workflow={row.workflow} compact />}
                  <span className="sr-table-card__route">
                    <span>{row.pickupCity || row.pickupLocation}</span>
                    <ArrowRight size={11} strokeWidth={2} />
                    <span>{row.deliveryCity || row.deliveryLocation}</span>
                  </span>
                </>
              ),
            })}
            colFilters={filters.colFilters}
            onColFilterChange={(colFilters) => patch({ colFilters })}
            selectedIds={selectedIds}
            onToggleRow={toggleRow}
            onToggleAll={toggleAll}
            onRowClick={(row) => navigate(`/orders/${row.id}`)}
            hoverTitle={(row) => row.orderNo}
            hoverSubtitle={(row) => `${row.customer} · ${row.poNo}`}
            hoverDetails={(row) => [
              { label: 'Amount', value: formatCurrency(row.invoiceAmount) },
              { label: 'Pick Up', value: formatDate(row.pickUpDate) },
              { label: 'Delivery', value: formatDate(row.deliveryDate) },
              { label: 'Billing', value: row.poBillingStatus },
              { label: 'Route', value: `${row.pickupLocation} → ${row.deliveryLocation}` },
            ]}
            emptyTitle="No orders match these filters"
            emptyHint="Try adjusting validation filters or clearing search"
            emptyAction={
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                Clear filters
              </Button>
            }
            columns={[
              {
                key: 'orderNo',
                header: 'Order',
                thClassName: 'col-order',
                cell: (row) => <OrderCell row={row} />,
              },
              {
                key: 'customer',
                header: 'Customer',
                thClassName: 'col-customer',
                filter: { type: 'text' },
                cell: (row) => <CustomerCell row={row} />,
              },
              {
                key: 'route',
                header: 'Route',
                thClassName: 'col-route sr-col-hide-md',
                hideBelow: 'md',
                cell: (row) => (
                  <div className="sr-cell-route">
                    <span className="sr-cell-route__city">{row.pickupCity || row.pickupLocation}</span>
                    <ArrowRight size={11} strokeWidth={2} className="shrink-0 opacity-40" />
                    <span className="sr-cell-route__city">{row.deliveryCity || row.deliveryLocation}</span>
                  </div>
                ),
              },
              {
                key: 'invoiceAmount',
                header: 'Amount',
                align: 'right',
                thClassName: 'col-amount',
                filter: { type: 'range' },
                cell: (row) => <span className="sr-cell-amount">{formatCurrency(row.invoiceAmount)}</span>,
              },
              {
                key: 'workflow',
                header: 'Stage',
                thClassName: 'col-stage',
                cell: (row) =>
                  row.workflow ? (
                    <WorkflowStageBadge workflow={row.workflow} />
                  ) : (
                    <span className="sr-status-text sr-status-text--muted">—</span>
                  ),
              },
              {
                key: 'actions',
                header: '',
                thClassName: 'col-action',
                cell: (row) => (
                  <RowQuickActions
                    onOpen={() => navigate(`/orders/${row.id}`)}
                    onAudit={() => addToast(`Auditing ${row.orderNo}…`)}
                    onInvoice={() => addToast(`Draft invoice for ${row.orderNo}`)}
                  />
                ),
              },
            ]}
          />
        </div>
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
        onApply={() => addToast('Filters applied')}
        onClear={resetFilters}
      />
    </motion.div>
  )
}

function OrderCell({ row }: { row: Order }) {
  return (
    <div>
      <div className="sr-cell-order__id">{row.orderNo}</div>
      <div className="sr-cell-order__meta">
        <span>{row.poNo}</span>
        <span>{row.equipment}</span>
      </div>
    </div>
  )
}

function CustomerCell({ row }: { row: Order }) {
  return (
    <div>
      <div className="sr-cell-customer__name">{row.customer}</div>
      <div className="sr-cell-customer__sub">{row.division}</div>
    </div>
  )
}
