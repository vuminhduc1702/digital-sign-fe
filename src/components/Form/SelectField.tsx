import clsx from 'clsx'
import { type UseFormRegisterReturn } from 'react-hook-form'
import { type ChangeEvent } from 'react'

import { FieldWrapper, type FieldWrapperPassThroughProps } from './FieldWrapper'

export type SelectOption = {
  label: string
  value: string | boolean
}

type SelectFieldProps = FieldWrapperPassThroughProps & {
  options: SelectOption[]
  className?: string
  placeholder?: string
  registration: Partial<UseFormRegisterReturn>
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void
}

export const SelectField = ({
  label,
  options,
  error,
  className,
  registration,
  placeholder,
  ...props
}: SelectFieldProps) => {
  return (
    <FieldWrapper label={label} error={error}>
      <select
        placeholder={placeholder}
        name="location"
        className={clsx(
          'mt-1 block w-full rounded-md border border-secondary-600 py-2 pl-3 pr-10 text-body-sm focus:border-secondary-600 focus:outline-none focus:ring-secondary-900',
          className,
        )}
        {...registration}
        {...props}
      >
        {options.map(({ label, value }) => (
          <option key={label?.toString()} value={value}>
            {label}
          </option>
        ))}
      </select>
    </FieldWrapper>
  )
}
