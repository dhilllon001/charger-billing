import { Search } from 'lucide-react'
import { cn } from '@/lib/cn'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  scope?: { value: string; options: { value: string; label: string }[]; onChange: (v: string) => void }
}

export function SearchInput({ value, onChange, placeholder, className, scope }: SearchInputProps) {
  return (
    <div className={cn('relative flex items-center', className)}>
      <Search size={16} strokeWidth={1.7} className="absolute left-3 text-ink-3" />
      {scope && (
        <select
          value={scope.value}
          onChange={(e) => scope.onChange(e.target.value)}
          className="absolute left-9 z-10 border-none bg-transparent text-[11px] font-medium text-ink-3 outline-none"
        >
          {scope.options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      )}
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'h-9 w-full rounded-[10px] border border-line bg-white pl-9 pr-3 text-[13px] text-ink placeholder:text-ink-3 outline-none transition-shadow focus:shadow-[0_0_0_3px_var(--accent-soft)]',
          scope && 'pl-28'
        )}
      />
    </div>
  )
}
