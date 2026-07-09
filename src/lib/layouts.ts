import type { ColumnOrderState, VisibilityState, SortingState } from '@tanstack/react-table'

export interface SavedLayout {
  id: string
  name: string
  columnVisibility: VisibilityState
  columnOrder: ColumnOrderState
  sorting: SortingState
}

const STORAGE_PREFIX = 'charger-billing-layout-'

export function getLayouts(gridId: string): SavedLayout[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${gridId}`)
    return raw ? JSON.parse(raw) : [{ id: 'default', name: 'Default', columnVisibility: {}, columnOrder: [], sorting: [] }]
  } catch {
    return [{ id: 'default', name: 'Default', columnVisibility: {}, columnOrder: [], sorting: [] }]
  }
}

export function saveLayout(gridId: string, layout: SavedLayout): void {
  const layouts = getLayouts(gridId)
  const idx = layouts.findIndex((l) => l.id === layout.id)
  if (idx >= 0) layouts[idx] = layout
  else layouts.push(layout)
  localStorage.setItem(`${STORAGE_PREFIX}${gridId}`, JSON.stringify(layouts))
}

export function saveLayoutAsNew(gridId: string, name: string, layout: Omit<SavedLayout, 'id' | 'name'>): SavedLayout {
  const newLayout: SavedLayout = { id: `layout-${Date.now()}`, name, ...layout }
  const layouts = getLayouts(gridId)
  layouts.push(newLayout)
  localStorage.setItem(`${STORAGE_PREFIX}${gridId}`, JSON.stringify(layouts))
  return newLayout
}
