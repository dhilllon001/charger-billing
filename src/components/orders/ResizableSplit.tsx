import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'

type ResizableSplitProps = {
  left: React.ReactNode
  right: React.ReactNode
  defaultRatio?: number
  minRatio?: number
  maxRatio?: number
  className?: string
}

export function ResizableSplit({
  left,
  right,
  defaultRatio = 58,
  minRatio = 38,
  maxRatio = 72,
  className,
}: ResizableSplitProps) {
  const [ratio, setRatio] = useState(defaultRatio)
  const [dragging, setDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    setDragging(true)
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }, [])

  useEffect(() => {
    if (!dragging) return

    const onMove = (e: PointerEvent) => {
      const el = containerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const next = ((e.clientX - rect.left) / rect.width) * 100
      setRatio(Math.min(maxRatio, Math.max(minRatio, next)))
    }

    const onUp = () => setDragging(false)

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [dragging, minRatio, maxRatio])

  return (
    <div ref={containerRef} className={cn('od-splitter', dragging && 'od-splitter--dragging', className)}>
      <div className="od-splitter__left" style={{ flex: `0 0 ${ratio}%` }}>
        {left}
      </div>
      <div
        className={cn('od-splitter__handle', dragging && 'is-dragging')}
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize panels"
        onPointerDown={onPointerDown}
      />
      <div className="od-splitter__right">{right}</div>
    </div>
  )
}
