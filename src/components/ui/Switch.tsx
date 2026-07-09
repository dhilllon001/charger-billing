import { cn } from '@/lib/cn'

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  className?: string
  onClick?: (e: React.MouseEvent) => void
}

export function Switch({ checked, onChange, className, onClick }: SwitchProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={(e) => {
        onClick?.(e)
        if (!e.defaultPrevented) onChange(!checked)
      }}
      className={cn(
        'relative h-[23px] w-[38px] shrink-0 rounded-full transition-colors duration-200 ease-[var(--ease-apple)]',
        checked ? 'bg-green' : 'bg-black/20',
        className
      )}
    >
      <span
        className={cn(
          'absolute top-[2px] left-[2px] h-[19px] w-[19px] rounded-full bg-white shadow-sm transition-transform duration-200 ease-[var(--ease-apple)]',
          checked && 'translate-x-[15px]'
        )}
      />
    </button>
  )
}
