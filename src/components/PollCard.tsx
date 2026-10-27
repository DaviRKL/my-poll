import React from 'react'
import { Card } from './ui/Card'
import { cn } from '../utils/cn'

export interface PollCardProps {
  title: string
  startDate: string
  endDate: string
  onClick?: () => void
  className?: string
}

export const PollCard: React.FC<PollCardProps> = ({
  title,
  startDate,
  endDate,
  onClick,
  className,
}) => {
  return (
    <Card
      onClick={onClick}
      className={cn(
        'p-5 sm:p-6 flex flex-col justify-between transition-all duration-200 border border-neutral-100 dark:border-neutral-700/60',
        onClick && 'cursor-pointer hover:shadow-lg hover:border-primary-500/40 hover:-translate-y-0.5',
        className,
      )}
    >
      <h3 className="font-bold text-base sm:text-lg text-neutral-900 dark:text-white line-clamp-2">
        {title}
      </h3>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-y-1 gap-x-4 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
        <span>
          Inicio: <span className="font-medium">{startDate}</span>
        </span>
        <span>
          Término: <span className="font-medium">{endDate}</span>
        </span>
      </div>
    </Card>
  )
}
