import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { useSpinDelay } from 'spin-delay'

import { cn } from '@/utils/misc'
import { Spinner } from '../Spinner'

const buttonVariants = cva(
  'flex cursor-pointer items-center justify-center rounded-md font-medium gap-x-2 border border-secondary-600 shadow-sm hover:opacity-80 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70',
  {
    variants: {
      variant: {
        primary: 'bg-primary-400 text-white',
        secondary: 'bg-secondary-600 hover:bg-secondary/80',
        secondaryLight: 'bg-secondary-500',
        danger: 'bg-primary-400 text-white',
        trans: 'bg-transparent',
        muted: 'bg-white',
        outline:
          'border-input bg-background hover:bg-accent hover:text-accent-foreground',
        none: 'bg-transparent shadow-none border-none',
      },
      size: {
        sm: 'py-2 px-4',
        md: 'py-2 px-6',
        lg: 'py-3 px-8',
        square: 'py-2 px-2',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

export type IconProps =
  | { startIcon: React.ReactElement; endIcon?: never }
  | { endIcon: React.ReactElement; startIcon?: never }
  | { endIcon?: undefined; startIcon?: undefined }

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    isLoading?: boolean
  } & IconProps

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      type = 'button',
      className,
      variant,
      size,
      asChild = false,
      isLoading = false,
      startIcon,
      endIcon,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button'
    const showSpinner = useSpinDelay(isLoading, {
      delay: 150,
      minDuration: 300,
    })

    return (
      <Comp
        type={type}
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={showSpinner}
        {...props}
      >
        {showSpinner && (
          <Spinner size="sm" variant="light" className="text-current" />
        )}
        <span className="flex items-center justify-between gap-x-2">
          {!showSpinner && startIcon}
          {props.children}
          {!showSpinner && endIcon}
        </span>
      </Comp>
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
