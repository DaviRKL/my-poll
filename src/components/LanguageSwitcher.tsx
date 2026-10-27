import React from 'react'
import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'
import { cn } from '../utils/cn'

export interface LanguageSwitcherProps {
  className?: string
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className,
}) => {
  const { i18n, t } = useTranslation()

  const currentLang = i18n.resolvedLanguage || i18n.language || 'pt-BR'
  const isPt = currentLang.toLowerCase().startsWith('pt')

  const handleLanguageChange = (lang: 'pt-BR' | 'en-US') => {
    i18n.changeLanguage(lang)
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang
    }
  }

  return (
    <div
      role="group"
      aria-label={t('language.switcherAria', 'Selecionar idioma')}
      className={cn(
        'inline-flex items-center rounded-lg bg-neutral-100 dark:bg-neutral-800/80 p-0.5 border border-neutral-200 dark:border-neutral-700 text-xs font-semibold select-none',
        className,
      )}
    >
      <Globe size={13} className="text-neutral-400 ml-1.5 mr-1 shrink-0" aria-hidden="true" />

      <button
        type="button"
        onClick={() => handleLanguageChange('pt-BR')}
        aria-pressed={isPt}
        title={t('language.pt', 'Português')}
        className={cn(
          'px-2 py-1 rounded-md transition-all cursor-pointer font-medium',
          isPt
            ? 'bg-white dark:bg-neutral-700 text-primary-500 dark:text-primary-400 shadow-xs'
            : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white',
        )}
      >
        PT
      </button>

      <button
        type="button"
        onClick={() => handleLanguageChange('en-US')}
        aria-pressed={!isPt}
        title={t('language.en', 'Inglês')}
        className={cn(
          'px-2 py-1 rounded-md transition-all cursor-pointer font-medium',
          !isPt
            ? 'bg-white dark:bg-neutral-700 text-primary-500 dark:text-primary-400 shadow-xs'
            : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white',
        )}
      >
        EN
      </button>
    </div>
  )
}
