import { useMemo, useState, useCallback } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MoreHorizontal, ArrowRight, Sparkles, Check, Minus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Segment } from '@/components/ui/Segment'
import { SearchInput } from '@/components/ui/SearchInput'
import { CopyableMono, TwoLineCell } from '@/components/ui/Table'
import { WorkflowStageBadge } from '@/components/ui/WorkflowStepper'
import { PageHeader } from '@/components/layout/PageHeader'
import { SelectActionBar } from '@/components/layout/SelectActionBar'
import { FiltersDrawer } from '@/components/layout/FiltersDrawer'
import { ReportFilterStrip } from '@/components/report/ReportFilterStrip'
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
import { formatCurrency, formatDate } from '@/lib/format'
import { cn } from '@/lib/cn'
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
      label: 'Quick POD Invoice',
      active: filters.quickPod,
      onClick: () => patch({ quickPod: !filters.quickPod }),
      onClear: () => patch({ quickPod: false }),
    },
    {
      key: 'poBilling',
      label: `PO Billing: ${filters.poBillingStatus === 'ALL' ? 'Any' : filters.poBillingStatus}`,
      active: filters.poBillingStatus !== 'ALL',
      onClick: () => cycleSelect('poBillingStatus', PO_BILLING_OPTIONS),
      onClear: () => patch({ poBillingStatus: 'ALL' }),
    },
    {
      key: 'customer',
      label: `Customer: ${filters.customer === 'ALL' ? 'Any' : filters.customer}`,
      active: filters.customer !== 'ALL',
      onClick: () => cycleSelect('customer', CUSTOMERS),
      onClear: () => patch({ customer: 'ALL' }),
    },
    {
      key: 'division',
      label: `Division: ${filters.division === 'ALL' ? 'Any' : filters.division}`,
      active: filters.division !== 'ALL',
      onClick: () => cycleSelect('division', DIVISIONS),
      onClear: () => patch({ division: 'ALL' }),
    },
    { key: 'allFilters', label: 'All filters', onClick: () => setFiltersOpen(true) },
  ]

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="sr-report-page">
      <PageHeader
        title="Batch Invoicing"
        subtitle="Review orders across rate, ops, and POD validation — generate invoices when ready."
        actions={
          <>
            <Button variant="ai" size="sm" onClick={() => addToast('AI validated 735 orders — 58 flagged for review')}>
              <Sparkles size={14} strokeWidth={1.7} /> <span className="hidden sm:inline">Auto-validate all (AI)</span>
              <span className="sm:hidden">AI Validate</span>
            </Button>
            <Link to="/consolidated">
              <Button variant="ghost" size="sm">
                Consolidated view
              </Button>
            </Link>
          </>
        }
      />

      <div className="sr-stat-strip">
        <div className="sr-stat">
          <div className="sr-stat__label">Pipeline</div>
          <div className="sr-stat__value">{stageCounts.all.toLocaleString()}</div>
        </div>
        <div className="sr-stat">
          <div className="sr-stat__label">Showing</div>
          <div className="sr-stat__value">{filtered.length.toLocaleString()}</div>
        </div>
        <div className="sr-stat">
          <div className="sr-stat__label">Selected</div>
          <div className="sr-stat__value">{selectedIds.size.toLocaleString()}</div>
        </div>
        <div className="sr-stat">
          <div className="sr-stat__label">Invoice total</div>
          <div className="sr-stat__value">
            {formatCurrency(filtered.reduce((s, o) => s + o.invoiceAmount, 0))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Segment
          items={segments}
          value={filters.stage}
          onChange={(stage) => patch({ stage })}
          className="min-w-max"
        />
      </div>

      <div className="flex flex-col gap-2">
        <SearchInput
          value={filters.search}
          onChange={(search) => patch({ search })}
          placeholder="Search order, PO or customer…"
          className="w-full lg:max-w-sm"
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
        <ReportFilterStrip items={filterStripItems} activeCount={activeCount} onReset={resetFilters} />
        <AppliedFiltersRow chips={appliedFilters} onClearAll={resetFilters} />
      </div>

      <div className="sr-report-card sr-report-card--flush">
        <div className="sr-table-toolbar">
          <span>
            <strong>{filtered.length}</strong> orders
            {activeCount > 0 && <span> · {activeCount} filter{activeCount !== 1 ? 's' : ''} active</span>}
          </span>
          <span className="mono font-semibold" style={{ color: 'var(--sr-text-primary)' }}>
            {formatCurrency(filtered.reduce((s, o) => s + o.invoiceAmount, 0))}
          </span>
        </div>
        <SrDataTable
        rows={filtered}
        responsive
        mobileCard={(row) => ({
          title: row.orderNo,
          subtitle: `${row.customer} · ${row.poNo}`,
          amount: formatCurrency(row.invoiceAmount),
          meta: (
            <>
              {row.workflow && <WorkflowStageBadge workflow={row.workflow} compact />}
              <span className="sr-table-card__route">
                <span>{row.pickupCity || row.pickupLocation}</span>
                <ArrowRight size={11} strokeWidth={2} />
                <span>{row.deliveryCity || row.deliveryLocation}</span>
              </span>
              <span className="sr-status-text">{row.poBillingStatus}</span>
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
          { label: 'Invoice Amt', value: formatCurrency(row.invoiceAmount) },
          { label: 'Pick Up', value: formatDate(row.pickUpDate) },
          { label: 'Delivery', value: formatDate(row.deliveryDate) },
          { label: 'Status', value: row.poBillingStatus },
          { label: 'Route', value: `${row.pickupLocation} → ${row.deliveryLocation}` },
        ]}
        footer={{
          label: `${filtered.length} orders`,
          cells: [formatCurrency(filtered.reduce((s, o) => s + o.invoiceAmount, 0))],
        }}
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
            cell: (row) => (
              <span className="rep-name">
                <CopyableMono value={row.orderNo} sub={`${row.poNo} · ${row.equipment}`} />
              </span>
            ),
          },
          {
            key: 'customer',
            header: 'Customer',
            filter: { type: 'text' },
            cell: (row) => <TwoLineCell primary={row.customer} secondary={row.division} />,
          },
          {
            key: 'route',
            header: 'Route',
            hideBelow: 'lg',
            cell: (row) => (
              <div className="flex items-center gap-1 text-[11px] text-[var(--sr-text-secondary)]">
                <span className="max-w-[72px] truncate">{row.pickupCity || row.pickupLocation}</span>
                <ArrowRight size={11} strokeWidth={2} className="shrink-0 opacity-50" />
                <span className="max-w-[72px] truncate">{row.deliveryCity || row.deliveryLocation}</span>
              </div>
            ),
          },
          {
            key: 'pickUpDate',
            header: 'Pick Up',
            hideBelow: 'md',
            cell: (row) => <span className="text-[11px] tabular-nums">{formatDate(row.pickUpDate)}</span>,
          },
          {
            key: 'deliveryDate',
            header: 'Delivery',
            hideBelow: 'md',
            cell: (row) => <span className="text-[11px] tabular-nums">{formatDate(row.deliveryDate)}</span>,
          },
          {
            key: 'invoiceAmount',
            header: 'Amount',
            align: 'right',
            filter: { type: 'range' },
            cell: (row) => <span className="mono font-semibold">{formatCurrency(row.invoiceAmount)}</span>,
          },
          {
            key: 'workflow',
            header: 'Stage',
            cell: (row) =>
              row.workflow ? (
                <WorkflowStageBadge workflow={row.workflow} />
              ) : (
                <span className="sr-status-text sr-status-text--muted">—</span>
              ),
          },
          {
            key: 'poBillingStatus',
            header: 'Billing',
            hideBelow: 'md',
            cell: (row) => <BillingStatusText status={row.poBillingStatus} />,
          },
          {
            key: 'aiCheck',
            header: 'AI',
            hideBelow: 'lg',
            cell: (row) => <AiCheckText check={row.aiCheck} />,
          },
          {
            key: 'audited',
            header: 'Aud.',
            hideBelow: 'lg',
            cell: (row) =>
              row.audited ? (
                <Check size={14} strokeWidth={2} className="text-[var(--sr-positive)]" />
              ) : (
                <Minus size={14} strokeWidth={2} className="text-[var(--sr-text-disabled)]" />
              ),
          },
          {
            key: 'actions',
            header: '',
            cell: (row) => (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  navigate(`/orders/${row.id}`)
                }}
                className="rounded p-1 text-[var(--sr-text-meta)] hover:bg-[var(--sr-surface-2)]"
              >
                <MoreHorizontal size={16} strokeWidth={1.7} />
              </button>
            ),
          },
        ]}
        />
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

function BillingStatusText({ status }: { status: string }) {
  const cls =
    status === 'Billed'
      ? 'sr-status-text--positive'
      : status === 'Hold'
        ? 'sr-status-text--negative'
        : ''
  return <span className={cn('sr-status-text', cls)}>{status}</span>
}

function AiCheckText({ check }: { check: Order['aiCheck'] }) {
  if (check.state === 'auto_validated') return <span className="sr-status-text sr-status-text--positive">Validated</span>
  if (check.state === 'rate_variance') return <span className="sr-status-text">Variance</span>
  if (check.state === 'pod_missing') return <span className="sr-status-text sr-status-text--negative">No POD</span>
  return <span className="sr-status-text sr-status-text--muted">Pending</span>
}
