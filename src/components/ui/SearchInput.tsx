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
    <div className={cn('sr-search', scope && 'sr-search--scoped', className)}>
      <Search size={15} strokeWidth={2} className="sr-search__icon" />
      {scope && (
        <select
          value={scope.value}
          onChange={(e) => scope.onChange(e.target.value)}
          className="sr-search__scope"
        >
          {scope.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  )
}
