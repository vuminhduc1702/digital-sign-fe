import * as React from 'react'
import { useSpinDelay } from 'spin-delay'

import { Spinner } from '@/components/Spinner'
import { cn } from '@/utils/misc'

const variants = {
  primary: 'bg-primary-400 text-white',
  secondary: 'bg-secondary-600',
  secondaryLight: 'bg-secondary-500',
  danger: 'bg-primary-400 text-white',
  trans: 'bg-transparent',
  muted: 'bg-white',
  none: 'bg-transparent shadow-none border-none',
}

const sizes = {
  sm: 'py-2 px-4 !text-body-light',
  md: 'py-2 px-6 !text-body-md',
  lg: 'py-3 px-8 !text-body-md',
  square: 'py-2 px-2',
}

export type IconProps =
  | { startIcon: React.ReactElement; endIcon?: never }
  | { endIcon: React.ReactElement; startIcon?: never }
  | { endIcon?: undefined; startIcon?: undefined }

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants
  size?: keyof typeof sizes
  isLoading?: boolean
} & IconProps

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      type = 'button',
      className = '',
      variant = 'primary',
      size = 'md',
      isLoading = false,
      startIcon,
      endIcon,
      ...props
    },
    ref,
  ) => {
    const showSpinner = useSpinDelay(isLoading, {
      delay: 150,
      minDuration: 300,
    })

    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          'flex cursor-pointer items-center justify-center gap-x-2 border border-gray-400 shadow-sm hover:opacity-80 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70',
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      >
        {showSpinner && (
          <Spinner size="sm" variant="light" className="text-current" />
        )}
        <span className="flex justify-between gap-x-2">
          {!showSpinner && startIcon}
          {props.children}
          {!showSpinner && endIcon}
        </span>
      </button>
    )
  },
)

Button.displayName = 'Button'
