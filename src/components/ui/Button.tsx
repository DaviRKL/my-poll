import React from 'react'
import { cn } from '../../utils/cn'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      leftIcon,
      rightIcon,
      disabled,
      type = 'button',
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-150 cursor-pointer select-none focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.99]'

    const variantStyles = {
      primary:
        'bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white shadow-xs focus-visible:ring-primary-500/50',
      secondary:
        'bg-neutral-600 hover:bg-neutral-700 active:bg-neutral-800 text-white shadow-xs dark:bg-neutral-700 dark:hover:bg-neutral-600 dark:active:bg-neutral-500 focus-visible:ring-neutral-500/50',
      outline:
        'border border-primary-500 text-primary-500 bg-transparent hover:bg-primary-500/10 active:bg-primary-500/20 dark:border-primary-400 dark:text-primary-400 dark:hover:bg-primary-400/10 focus-visible:ring-primary-500/50',
    }

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-xs rounded-md gap-1.5',
      md: 'px-5 py-2.5 text-sm rounded-md gap-2',
      lg: 'px-6 py-3 text-base rounded-md gap-2.5',
    }

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          fullWidth ? 'w-full' : 'w-auto',
          className,
        )}
        {...props}
      >
        {leftIcon && <span className="shrink-0">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    )
  },
)

Button.displayName = 'Button'
