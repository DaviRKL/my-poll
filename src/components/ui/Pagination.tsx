import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const { t } = useTranslation()

  if (totalPages < 2) return null

  const pages: (number | 'ellipsis-start' | 'ellipsis-end')[] =
    totalPages <= 7
      ? Array.from({ length: totalPages }, (_, index) => index + 1)
      : currentPage <= 4
        ? [1, 2, 3, 4, 5, 'ellipsis-end', totalPages]
        : currentPage >= totalPages - 3
          ? [
              1,
              'ellipsis-start',
              totalPages - 4,
              totalPages - 3,
              totalPages - 2,
              totalPages - 1,
              totalPages,
            ]
          : [
              1,
              'ellipsis-start',
              currentPage - 1,
              currentPage,
              currentPage + 1,
              'ellipsis-end',
              totalPages,
            ]

  return (
    <nav
      aria-label={t('pagination.pageOf', {
        current: currentPage,
        total: totalPages,
        defaultValue: `Page ${currentPage} of ${totalPages}`,
      })}
      className="flex flex-col items-center gap-3 pt-2"
    >
      <div className="flex items-center justify-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="inline-flex items-center gap-1 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-200 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronLeft size={16} aria-hidden="true" />
          {t('pagination.previous', 'Anterior')}
        </button>

        <div className="flex items-center gap-1">
          {pages.map((page) =>
            typeof page === 'number' ? (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page)}
                aria-current={page === currentPage ? 'page' : undefined}
                aria-label={t('pagination.pageNumber', {
                  page,
                  defaultValue: `Page ${page}`,
                })}
                className={`min-w-9 rounded-md px-2.5 py-2 text-sm font-medium transition-colors ${
                  page === currentPage
                    ? 'bg-primary-500 text-white'
                    : 'border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                }`}
              >
                {page}
              </button>
            ) : (
              <span
                key={page}
                aria-hidden="true"
                className="px-1 text-neutral-500 dark:text-neutral-400"
              >
                …
              </span>
            ),
          )}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="inline-flex items-center gap-1 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-200 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t('pagination.next', 'Próximo')}
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      </div>
      <p className="text-xs text-neutral-500 dark:text-neutral-400" aria-live="polite">
        {t('pagination.pageOf', {
          current: currentPage,
          total: totalPages,
          defaultValue: `Página ${currentPage} de ${totalPages}`,
        })}
      </p>
    </nav>
  )
}
