import clsx from 'clsx'
import { type UseFormRegisterReturn } from 'react-hook-form'

import { FieldWrapper, type FieldWrapperPassThroughProps } from './FieldWrapper'

type TextAreaFieldProps = FieldWrapperPassThroughProps & {
  rows?: number,
  className?: string
  registration?: Partial<UseFormRegisterReturn>
}

export const TextAreaField = (props: TextAreaFieldProps) => {
  const { rows, label, className, registration, error } = props
  return (
    <FieldWrapper label={label} error={error}>
      <textarea 
        className={clsx(
          'focus:secondary-900 block w-full appearance-none rounded-md border border-secondary-600 px-3 py-2 text-black placeholder-secondary-700 shadow-sm focus:outline-none focus:ring-secondary-900 sm:text-body-sm',
          className,
        )}
        rows={rows}
        {...registration}
        {...props}
      />
    </FieldWrapper>
  )
}
