import { useState, useCallback, type MouseEvent } from 'react'

export type RowHoverState<T> = {
  id: string
  data: T
  rect: DOMRect
  pointer: { x: number; y: number }
} | null

const MARGIN = 14
const OFFSET = 12

export function clampPopoverPosition(
  pointer: { x: number; y: number },
  popoverW = 280,
  popoverH = 160
): { left: number; top: number } {
  const vw = window.innerWidth
  const vh = window.innerHeight
  let left = pointer.x + OFFSET
  let top = pointer.y + OFFSET
  if (left + popoverW + MARGIN > vw) left = pointer.x - popoverW - OFFSET
  if (top + popoverH + MARGIN > vh) top = pointer.y - popoverH - OFFSET
  left = Math.max(MARGIN, Math.min(left, vw - popoverW - MARGIN))
  top = Math.max(MARGIN, Math.min(top, vh - popoverH - MARGIN))
  return { left, top }
}

export function useRowHover<T>() {
  const [hover, setHover] = useState<RowHoverState<T>>(null)

  const bind = useCallback((id: string, data: T) => ({
    onMouseEnter: (e: MouseEvent<HTMLElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      setHover({ id, data, rect, pointer: { x: e.clientX, y: e.clientY } })
    },
    onMouseMove: (e: MouseEvent<HTMLElement>) => {
      setHover((prev) =>
        prev?.id === id ? { ...prev, pointer: { x: e.clientX, y: e.clientY } } : prev
      )
    },
    onMouseLeave: () => setHover(null),
  }), [])

  const isHovered = useCallback((id: string) => hover?.id === id, [hover])

  return { hover, bind, isHovered, clear: () => setHover(null) }
}
