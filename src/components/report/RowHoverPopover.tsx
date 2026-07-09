import { createPortal } from 'react-dom'
import { clampPopoverPosition, type RowHoverState } from '@/hooks/useRowHover'

export type HoverDetail = { label: string; value: string }

type RowHoverPopoverProps<T> = {
  hover: RowHoverState<T>
  getTitle: (data: T) => string
  getSubtitle?: (data: T) => string
  getDetails: (data: T) => HoverDetail[]
}

export function RowHoverPopover<T>({ hover, getTitle, getSubtitle, getDetails }: RowHoverPopoverProps<T>) {
  if (!hover) return null

  const { left, top } = clampPopoverPosition(hover.pointer)
  const details = getDetails(hover.data)

  return createPortal(
    <div className="sr-row-popover" style={{ left, top }} role="tooltip">
      <div className="sr-row-popover__title">{getTitle(hover.data)}</div>
      {getSubtitle && <div className="sr-row-popover__subtitle">{getSubtitle(hover.data)}</div>}
      {details.length > 0 && (
        <dl className="sr-row-popover__grid">
          {details.map((d) => (
            <div key={d.label} className="contents">
              <dt>{d.label}</dt>
              <dd className="mono">{d.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>,
    document.body
  )
}
