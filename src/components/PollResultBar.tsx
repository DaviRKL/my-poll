import React from 'react'
import { cn } from '../utils/cn'

export interface PollResultBarProps {
  label: string
  votes: number
  percentage: number
  className?: string
}

export const PollResultBar: React.FC<PollResultBarProps> = ({
  label,
  votes,
  percentage,
  className,
}) => {
  // Garante que a porcentagem fique entre 0 e 100
  const safePercentage = Math.min(100, Math.max(0, percentage))

  return (
    <div
      role="progressbar"
      aria-label={`${label}: ${votes} votos (${safePercentage}%)`}
      aria-valuenow={safePercentage}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        'relative overflow-hidden w-full h-11 sm:h-12 rounded-md bg-[#3e51a8] dark:bg-[#283593] flex items-center justify-between px-4 sm:px-5 select-none shadow-xs transition-colors',
        className,
      )}
    >
      {/* Barra de preenchimento proporcional à porcentagem */}
      <div
        className="absolute inset-y-0 left-0 bg-primary-500 dark:bg-primary-400 transition-all duration-500 ease-out"
        style={{ width: `${safePercentage}%` }}
      />

      {/* Conteúdo de texto sobreposto (sempre visível em branco) */}
      <div className="relative z-10 flex items-center justify-between w-full text-white font-medium text-sm sm:text-base pointer-events-none">
        <span className="truncate pr-4">{label}</span>
        <span className="shrink-0 text-white/95 text-xs sm:text-sm">
          {votes} {votes === 1 ? 'voto' : 'votos'}
        </span>
      </div>
    </div>
  )
}
