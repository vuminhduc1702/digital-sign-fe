import clsx from 'clsx'
import { type UseFormRegisterReturn } from 'react-hook-form'

import { FieldWrapper, type FieldWrapperPassThroughProps } from './FieldWrapper'
import { cn } from '@/utils/misc'

type TextAreaFieldProps = FieldWrapperPassThroughProps & {
  rows?: number
  className?: string
  registration?: Partial<UseFormRegisterReturn>
  classnamefieldwrapper?: string
  classlabel?: string
  classchild?: string
}

export const TextAreaField = (props: TextAreaFieldProps) => {
  const {
    rows,
    label,
    className,
    registration,
    error,
    classnamefieldwrapper,
    classlabel,
    classchild,
  } = props
  return (
    <FieldWrapper
      className={cn('', classnamefieldwrapper)}
      label={label}
      error={error}
      classlabel={classlabel}
      classchild={classchild}
    >
      <textarea
        className={cn(
          'focus:secondary-900 block w-full appearance-none rounded-md border border-secondary-600 px-3 py-2 text-black placeholder-secondary-700 shadow-sm focus:outline-none focus:ring-secondary-900 disabled:cursor-not-allowed disabled:bg-secondary-500 sm:text-body-sm',
          className,
        )}
        rows={rows}
        {...registration}
        {...props}
      />
    </FieldWrapper>
  )
}
