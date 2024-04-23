import * as React from 'react'

import { cn } from '@/utils/misc'

import { useFormField } from './form'

type IconProps = {
  startIcon?: React.ReactElement
  endIcon?: React.ReactElement
  endText?: string
}

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps & IconProps>(
  ({ className, type, startIcon, endIcon, endText, ...props }, ref) => {
    const { error } = useFormField()

    return (
      <>
        {startIcon}
        <input
          type={type}
          className={cn(
            'block w-full appearance-none rounded-md border border-secondary-600 px-3 py-2 text-black shadow-sm placeholder:text-secondary-700 focus:outline-2 focus:outline-focus-400 focus:ring-focus-400 disabled:cursor-not-allowed disabled:bg-secondary-500',
            {
              'pl-8': startIcon,
              'pr-8': endIcon,
              'border-primary focus:outline-primary': error != null,
            },
            className,
          )}
          ref={ref}
          {...props}
        />
        {endIcon}
        {endText && (
          <span className="ml-2 text-xs font-medium text-black">{endText}</span>
        )}
      </>
    )
  },
)
Input.displayName = 'Input'

export { Input }
