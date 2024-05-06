import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { useSpinDelay } from 'spin-delay'

import { cn } from '@/utils/misc'
import { Spinner } from '../Spinner'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-white hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-600 hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-white underline-offset-4 hover:underline',
        primary: 'bg-primary-400 text-white',
        secondaryLight: 'bg-secondary-500',
        danger: 'bg-primary-400 text-white',
        trans: 'bg-transparent',
        muted: 'bg-white',
        none: 'bg-transparent shadow-none border-none',
      },
      size: {
        default: 'h-10 px-4 py-2',
        // sm: 'h-9 rounded-md px-3',
        // lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
        sm: 'py-2 px-4 !text-body-light',
        md: 'py-2 px-6 !text-body-md',
        lg: 'py-3 px-8 !text-body-md',
        square: 'py-2 px-2',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
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
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
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
