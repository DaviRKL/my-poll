import { Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useId } from 'react'

export interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  const { t } = useTranslation()
  const inputId = useId()
  const placeholder = t('search.placeholder', 'Pesquisar enquete...')

  return (
    <div className="relative w-full">
      <label htmlFor={inputId} className="sr-only">
        {placeholder}
      </label>
      <Search
        size={18}
        aria-hidden="true"
        className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 pointer-events-none"
      />
      <input
        id={inputId}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 py-2.5 pl-10 pr-3.5 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 shadow-xs transition-colors focus:border-primary-500 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20"
      />
    </div>
  )
}
