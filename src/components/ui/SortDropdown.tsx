import { ChevronDown } from 'lucide-react'
import { useId } from 'react'
import { useTranslation } from 'react-i18next'

export type SortOrder = 'desc' | 'asc'

export interface SortDropdownProps {
  value: SortOrder
  onChange: (value: SortOrder) => void
}

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  const { t } = useTranslation()
  const selectId = useId()

  return (
    <div className="w-full sm:w-44">
      <label
        htmlFor={selectId}
        className="mb-1 block text-xs font-medium text-neutral-500 dark:text-neutral-400"
      >
        {t('search.sortLabel', 'Ordenar por')}
      </label>
      <div className="relative">
        <select
          id={selectId}
          value={value}
          onChange={(event) => onChange(event.target.value as SortOrder)}
          className="w-full appearance-none rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3.5 py-2 pr-8 text-sm font-medium text-neutral-900 dark:text-neutral-100 shadow-xs transition-colors focus:border-primary-500 focus:outline-hidden focus:ring-2 focus:ring-primary-500/20"
        >
          <option value="desc">{t('search.newest', 'Mais recentes')}</option>
          <option value="asc">{t('search.oldest', 'Mais antigas')}</option>
        </select>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400"
        />
      </div>
    </div>
  )
}
