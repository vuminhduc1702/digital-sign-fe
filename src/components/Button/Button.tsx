import clsx from 'clsx'
import * as React from 'react'

import { Spinner } from '~/components/Spinner'

const variants = {
  primary: 'bg-primary-400 text-white',
  secondary: 'bg-secondary-500',
  danger: 'bg-red-600 text-white',
  trans: 'bg-transparent',
  muted: 'bg-white',
}

const sizes = {
  sm: 'py-2 px-4 text-body-light',
  md: 'py-2 px-6 text-md',
  lg: 'py-3 px-8 text-lg',
  square: 'py-2 px-2',
  'no-p': 'py-0',
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
    return (
      <button
        ref={ref}
        type={type}
        className={clsx(
          'flex cursor-pointer items-center justify-center border border-gray-400 font-medium shadow-sm hover:text-primary-400  hover:opacity-80 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70',
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      >
        {isLoading && <Spinner size="sm" className="text-current" />}
        <span className="flex justify-between gap-x-3">
          {!isLoading && startIcon}
          {props.children}
          {!isLoading && endIcon}
        </span>
      </button>
    )
  },
)

Button.displayName = 'Button'
