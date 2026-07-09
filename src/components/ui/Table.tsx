import { useState, useMemo, useCallback } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  type ColumnOrderState,
  type RowSelectionState,
} from '@tanstack/react-table'
import { ChevronLeft, ChevronRight, Columns3, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'
import { getLayouts, saveLayout, saveLayoutAsNew, type SavedLayout } from '@/lib/layouts'

interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T, any>[]
  gridId: string
  getRowId?: (row: T) => string
  rowSelection?: RowSelectionState
  onRowSelectionChange?: (selection: RowSelectionState) => void
  loading?: boolean
  emptyTitle?: string
  emptyHint?: string
  emptyAction?: React.ReactNode
}

export function DataTable<T>({
  data,
  columns,
  gridId,
  getRowId,
  rowSelection,
  onRowSelectionChange,
  loading,
  emptyTitle = 'No items found',
  emptyHint,
  emptyAction,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([])
  const [layoutId, setLayoutId] = useState('default')
  const [layoutMenuOpen, setLayoutMenuOpen] = useState(false)
  const [columnMenuOpen, setColumnMenuOpen] = useState(false)
  const layouts = useMemo(() => getLayouts(gridId), [gridId, layoutId])

  const table = useReactTable({
    data,
    columns,
    getRowId,
    state: { sorting, columnVisibility, columnOrder, rowSelection },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    onRowSelectionChange: onRowSelectionChange as (updater: RowSelectionState | ((old: RowSelectionState) => RowSelectionState)) => void,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 25 } },
    enableRowSelection: true,
  })

  const handleSaveLayout = useCallback(() => {
    const layout: SavedLayout = {
      id: layoutId,
      name: layouts.find((l) => l.id === layoutId)?.name ?? 'Default',
      columnVisibility,
      columnOrder,
      sorting,
    }
    saveLayout(gridId, layout)
  }, [gridId, layoutId, layouts, columnVisibility, columnOrder, sorting])

  const { pageIndex, pageSize } = table.getState().pagination
  const total = data.length
  const from = total === 0 ? 0 : pageIndex * pageSize + 1
  const to = Math.min((pageIndex + 1) * pageSize, total)

  if (!loading && total === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[16px] bg-card py-20 shadow-[var(--shadow-rest)]">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-black/[0.04] text-ink-3">
          <Columns3 size={22} strokeWidth={1.7} />
        </div>
        <p className="text-[15px] font-semibold text-ink">{emptyTitle}</p>
        {emptyHint && <p className="mt-1 text-[13px] text-ink-3">{emptyHint}</p>}
        {emptyAction && <div className="mt-4">{emptyAction}</div>}
      </div>
    )
  }

  return (
    <div className="rounded-[16px] bg-card shadow-[var(--shadow-rest)]">
      <div className="flex items-center justify-end gap-2 border-b border-line px-4 py-2">
        <div className="relative">
          <button
            onClick={() => setLayoutMenuOpen(!layoutMenuOpen)}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-[12px] text-ink-2 hover:bg-black/[0.04]"
          >
            Layout: {layouts.find((l) => l.id === layoutId)?.name ?? 'Default'}
            <ChevronDown size={14} strokeWidth={1.7} />
          </button>
          {layoutMenuOpen && (
            <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-xl border border-line bg-white py-1 shadow-[var(--shadow-hover)]">
              {layouts.map((l) => (
                <button
                  key={l.id}
                  onClick={() => {
                    setLayoutId(l.id)
                    setColumnVisibility(l.columnVisibility)
                    setColumnOrder(l.columnOrder)
                    setSorting(l.sorting)
                    setLayoutMenuOpen(false)
                  }}
                  className="block w-full px-3 py-1.5 text-left text-[12px] hover:bg-black/[0.04]"
                >
                  {l.name}
                </button>
              ))}
              <hr className="my-1 border-line" />
              <button onClick={handleSaveLayout} className="block w-full px-3 py-1.5 text-left text-[12px] text-accent hover:bg-black/[0.04]">Save layout</button>
              <button
                onClick={() => {
                  const name = prompt('Layout name')
                  if (name) {
                    const nl = saveLayoutAsNew(gridId, name, { columnVisibility, columnOrder, sorting })
                    setLayoutId(nl.id)
                  }
                  setLayoutMenuOpen(false)
                }}
                className="block w-full px-3 py-1.5 text-left text-[12px] text-accent hover:bg-black/[0.04]"
              >
                Save as new
              </button>
            </div>
          )}
        </div>
        <div className="relative">
          <button
            onClick={() => setColumnMenuOpen(!columnMenuOpen)}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-[12px] text-ink-2 hover:bg-black/[0.04]"
          >
            <Columns3 size={14} strokeWidth={1.7} /> Columns
          </button>
          {columnMenuOpen && (
            <div className="absolute right-0 top-full z-20 mt-1 max-h-64 w-52 overflow-y-auto rounded-xl border border-line bg-white py-1 shadow-[var(--shadow-hover)]">
              {table.getAllLeafColumns().filter((c) => c.id !== 'select').map((col) => (
                <label key={col.id} className="flex items-center gap-2 px-3 py-1.5 text-[12px] hover:bg-black/[0.04]">
                  <input
                    type="checkbox"
                    checked={col.getIsVisible()}
                    onChange={col.getToggleVisibilityHandler()}
                    className="rounded"
                  />
                  {typeof col.columnDef.header === 'string' ? col.columnDef.header : col.id}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead className="sticky top-0 z-10 bg-[#FCFCFD]">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className="border-b border-line px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-ink-3"
                  >
                    {header.isPlaceholder ? null : (
                      <button
                        className={cn('flex items-center gap-1', header.column.getCanSort() && 'cursor-pointer hover:text-ink')}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{ asc: ' ↑', desc: ' ↓' }[header.column.getIsSorted() as string] ?? null}
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-line">
                    {columns.map((_, j) => (
                      <td key={j} className="px-4 py-3.5">
                        <div className="h-4 animate-pulse rounded bg-black/[0.06]" />
                      </td>
                    ))}
                  </tr>
                ))
              : table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-b border-line transition-colors hover:bg-[#F7F9FC]">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3.5 text-[12.5px]">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-line px-4 py-3 text-[12px] text-ink-3">
        <span>{total.toLocaleString()} items · showing {from}–{to}</span>
        <div className="flex items-center gap-3">
          <select
            value={pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="rounded-lg border border-line bg-white px-2 py-1 text-[12px]"
          >
            {[25, 50, 100].map((s) => (
              <option key={s} value={s}>{s} / page</option>
            ))}
          </select>
          <div className="flex gap-1">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="rounded-lg p-1 hover:bg-black/[0.04] disabled:opacity-30"
            >
              <ChevronLeft size={16} strokeWidth={1.7} />
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="rounded-lg p-1 hover:bg-black/[0.04] disabled:opacity-30"
            >
              <ChevronRight size={16} strokeWidth={1.7} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function CopyableMono({ value, sub }: { value: string; sub?: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <div className="group">
      <button onClick={copy} className="flex items-center gap-1 font-mono text-[12.5px] font-semibold text-ink hover:text-accent">
        {value}
        <span className="opacity-0 transition-opacity group-hover:opacity-100 text-[10px] text-ink-3">{copied ? '✓' : '⎘'}</span>
      </button>
      {sub && <div className="text-[11px] text-ink-3">{sub}</div>}
    </div>
  )
}

export function TwoLineCell({ primary, secondary }: { primary: React.ReactNode; secondary?: React.ReactNode }) {
  return (
    <div>
      <div className="font-semibold text-ink">{primary}</div>
      {secondary && <div className="text-[11px] text-ink-3">{secondary}</div>}
    </div>
  )
}
