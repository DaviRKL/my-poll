import React, { useId } from 'react'
import { cn } from '../../utils/cn'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  icon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      icon,
      rightIcon,
      id,
      className,
      disabled,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId()
    const inputId = id || generatedId
    const resolvedRightIcon = rightIcon || icon

    return (
      <div className="w-full flex flex-col">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-1.5"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center w-full">
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={cn(
              'w-full px-3.5 py-2.5 text-sm rounded-md border transition-colors focus:outline-hidden',
              'bg-white text-neutral-900 placeholder:text-neutral-400',
              'dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500',
              'border-neutral-300 dark:border-neutral-700',
              'focus:border-primary-500 dark:focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20',
              resolvedRightIcon && 'pr-10',
              error &&
                'border-red-500 dark:border-red-400 focus:border-red-500 focus:ring-red-500/20',
              disabled &&
                'opacity-60 bg-neutral-100 dark:bg-neutral-800/60 cursor-not-allowed text-neutral-500 dark:text-neutral-400',
              className,
            )}
            {...props}
          />

          {resolvedRightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400 dark:text-neutral-500">
              {resolvedRightIcon}
            </div>
          )}
        </div>

        {error && (
          <p className="mt-1 text-xs text-red-500 dark:text-red-400">{error}</p>
        )}

        {!error && helperText && (
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            {helperText}
          </p>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'
