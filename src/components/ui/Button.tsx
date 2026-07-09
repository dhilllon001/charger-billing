import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'ghost' | 'ai' | 'danger' | 'dark'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: 'sm' | 'md' | 'lg'
}

const variants: Record<Variant, string> = {
  primary: 'bg-accent text-white hover:bg-[#184E8D] shadow-[var(--shadow-rest)]',
  ghost: 'bg-transparent text-ink-2 hover:bg-black/[0.04] border border-line',
  ai: 'ai-gradient text-white shadow-[var(--shadow-rest)] hover:opacity-95',
  danger: 'bg-red text-white hover:bg-[#C5221F]',
  dark: 'bg-ink text-white hover:bg-[#333]',
}

const sizes = {
  sm: 'h-8 px-3.5 text-[12px]',
  md: 'h-9 px-4 text-[13px]',
  lg: 'h-10 px-5 text-[13px] font-semibold',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-[9999px] font-medium transition-all duration-200 ease-[var(--ease-apple)] disabled:opacity-40 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
)
Button.displayName = 'Button'
