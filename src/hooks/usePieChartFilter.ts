import { useCallback } from 'react'

export function usePieChartFilter<T extends Record<string, unknown>>(
  filters: T,
  patch: (p: Partial<T>) => void,
  filterKey: keyof T,
  defaultVal = 'ALL'
) {
  const current = (filters[filterKey] as string) ?? defaultVal

  const onSliceClick = useCallback(
    (sliceId: string) => {
      patch({ [filterKey]: current === sliceId ? defaultVal : sliceId } as Partial<T>)
    },
    [current, filterKey, patch, defaultVal]
  )

  const selectedSliceIds = current !== defaultVal ? [current] : []

  const clear = useCallback(() => {
    patch({ [filterKey]: defaultVal } as Partial<T>)
  }, [filterKey, patch, defaultVal])

  return { selectedSliceIds, onSliceClick, clear, current }
}
