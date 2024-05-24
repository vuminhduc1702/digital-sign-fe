import * as React from 'react'

import { cn } from '@/utils/misc'

import { useFormField } from './form'
import { useTranslation } from 'react-i18next'

type IconProps = {
  startIcon?: React.ReactElement
  endIcon?: React.ReactElement
  endText?: string
}

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps & IconProps>(
  (
    { className, type, startIcon, endIcon, endText, placeholder, ...props },
    ref,
  ) => {
    const { error } = useFormField()
    const { t } = useTranslation()

    return (
      <div className="relative">
        {startIcon}
        <input
          type={type}
          className={cn(
            'block w-full appearance-none rounded-md border border-secondary-600 px-3 py-2 text-black shadow-sm placeholder:text-secondary-700 focus:outline-2 focus:outline-focus-400 focus:ring-focus-400 disabled:cursor-not-allowed disabled:bg-secondary-500',
            {
              'pl-10': startIcon,
              'pr-10': endIcon,
              'border-primary focus:outline-primary': error != null,
            },
            className,
          )}
          ref={ref}
          placeholder={placeholder ?? t('placeholder:input_text')}
          {...props}
        />
        {endIcon}
        {endText && (
          <span className="ml-2 text-xs font-medium text-black">{endText}</span>
        )}
      </div>
    )
  },
)
Input.displayName = 'Input'

export { Input }
