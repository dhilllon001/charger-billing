import { cn } from '@/lib/cn'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

export function Card({ children, className, hover, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-[16px] bg-card shadow-[var(--shadow-rest)]',
        hover && 'transition-all duration-200 ease-[var(--ease-apple)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-hover)] cursor-pointer',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  )
}
