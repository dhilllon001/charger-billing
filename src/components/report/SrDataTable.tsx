import { cn } from '@/lib/cn'
import { useRowHover } from '@/hooks/useRowHover'
import { RowHoverPopover, type HoverDetail } from './RowHoverPopover'
import { ColumnFilterHeader } from './ColumnFilterHeader'

export type SrColumn<T> = {
  key: string
  header: string
  align?: 'left' | 'right'
  filter?: { type: 'text' | 'range' }
  className?: string
  thClassName?: string
  /** Hide column below breakpoint */
  hideBelow?: 'md' | 'lg'
  cell: (row: T) => React.ReactNode
}

export type SrMobileCardRender<T> = (row: T) => {
  title: React.ReactNode
  subtitle?: React.ReactNode
  amount?: React.ReactNode
  meta?: React.ReactNode
}

type SrDataTableProps<T extends { id: string }> = {
  rows: T[]
  columns: SrColumn<T>[]
  colFilters?: Record<string, string | { min?: string; max?: string }>
  onColFilterChange?: (next: Record<string, string | { min?: string; max?: string }>) => void
  selectedIds?: Set<string>
  onToggleRow?: (id: string) => void
  onToggleAll?: (ids: string[]) => void
  onRowClick?: (row: T) => void
  hoverTitle?: (row: T) => string
  hoverSubtitle?: (row: T) => string
  hoverDetails?: (row: T) => HoverDetail[]
  footer?: { label: string; cells: React.ReactNode[] }
  emptyTitle?: string
  emptyHint?: string
  emptyAction?: React.ReactNode
  maxHeight?: string
  responsive?: boolean
  mobileCard?: SrMobileCardRender<T>
}

const hideClass: Record<NonNullable<SrColumn<unknown>['hideBelow']>, string> = {
  md: 'sr-col-hide-md',
  lg: 'sr-col-hide-lg',
}

export function SrDataTable<T extends { id: string }>({
  rows,
  columns,
  colFilters = {},
  onColFilterChange,
  selectedIds,
  onToggleRow,
  onToggleAll,
  onRowClick,
  hoverTitle,
  hoverSubtitle,
  hoverDetails,
  footer,
  emptyTitle = 'No rows',
  emptyHint,
  emptyAction,
  maxHeight = 'min(65vh, 720px)',
  responsive = false,
  mobileCard,
}: SrDataTableProps<T>) {
  const rowHover = useRowHover<T>()
  const allSelected = rows.length > 0 && selectedIds && rows.every((r) => selectedIds.has(r.id))
  const showHover = hoverTitle && hoverDetails

  if (rows.length === 0) {
    return (
      <div className="sr-table-empty">
        <p className="font-semibold text-[var(--sr-text-primary)]">{emptyTitle}</p>
        {emptyHint && <p className="mt-1 text-[12px]">{emptyHint}</p>}
        {emptyAction && <div className="mt-3">{emptyAction}</div>}
      </div>
    )
  }

  return (
    <>
      <div
        className={cn('sr-table-wrap', responsive && 'sr-table-wrap--responsive')}
        style={{ maxHeight }}
      >
        <table className="sr-table">
          <thead>
            <tr>
              {onToggleRow && (
                <th className="col-check" style={{ width: 40 }}>
                  <input
                    type="checkbox"
                    checked={!!allSelected}
                    onChange={() => onToggleAll?.(rows.map((r) => r.id))}
                    className="rounded"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(col.align === 'right' && 'num', col.hideBelow && hideClass[col.hideBelow], col.thClassName)}
                >
                  {col.filter && onColFilterChange ? (
                    <ColumnFilterHeader
                      label={col.header}
                      filterKey={col.key}
                      type={col.filter.type}
                      value={colFilters[col.key]}
                      onApply={(key, val) => {
                        const next = { ...colFilters }
                        if (val === undefined) delete next[key]
                        else next[key] = val
                        onColFilterChange?.(next)
                      }}
                    />
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const selected = selectedIds?.has(row.id)
              const hoverProps = showHover ? rowHover.bind(row.id, row) : {}
              return (
                <tr
                  key={row.id}
                  className={cn(
                    showHover && 'sr-table-row--hoverable',
                    onRowClick && 'sr-table-row--clickable',
                    selected && 'is-selected',
                    rowHover.isHovered(row.id) && 'is-hovered'
                  )}
                  onClick={() => onRowClick?.(row)}
                  {...hoverProps}
                >
                  {onToggleRow && (
                    <td onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={!!selected}
                        onChange={() => onToggleRow(row.id)}
                        className="rounded"
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        col.align === 'right' && 'num',
                        col.hideBelow && hideClass[col.hideBelow],
                        col.className
                      )}
                    >
                      {col.cell(row)}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
          {footer && (
            <tfoot>
              <tr>
                {onToggleRow && <td />}
                <td className="rep-name">{footer.label}</td>
                {footer.cells.map((cell, i) => (
                  <td key={i} className="num mono">
                    {cell}
                  </td>
                ))}
                {columns.length > footer.cells.length + 1 &&
                  Array.from({ length: columns.length - footer.cells.length - 1 }).map((_, i) => (
                    <td key={`pad-${i}`} />
                  ))}
              </tr>
            </tfoot>
          )}
        </table>

        {responsive && mobileCard && (
          <div className="sr-table-cards">
            {rows.map((row) => {
              const selected = selectedIds?.has(row.id)
              const card = mobileCard(row)
              return (
                <div
                  key={row.id}
                  className={cn('sr-table-card', selected && 'is-selected')}
                  onClick={() => onRowClick?.(row)}
                >
                  <div className="sr-table-card__head">
                    {onToggleRow && (
                      <input
                        type="checkbox"
                        checked={!!selected}
                        onChange={(e) => {
                          e.stopPropagation()
                          onToggleRow(row.id)
                        }}
                        className="mt-0.5 rounded"
                      />
                    )}
                    <div className="sr-table-card__main">
                      <div className="sr-table-card__order">{card.title}</div>
                      {card.subtitle && <div className="sr-table-card__sub">{card.subtitle}</div>}
                    </div>
                    {card.amount && <div className="sr-table-card__amt">{card.amount}</div>}
                  </div>
                  {card.meta && <div className="sr-table-card__row">{card.meta}</div>}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showHover && (
        <RowHoverPopover
          hover={rowHover.hover}
          getTitle={hoverTitle}
          getSubtitle={hoverSubtitle}
          getDetails={hoverDetails}
        />
      )}
    </>
  )
}
