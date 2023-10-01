import clsx from 'clsx'
import { type UseFormRegisterReturn } from 'react-hook-form'
import { type ChangeEvent } from 'react'

import { FieldWrapper, type FieldWrapperPassThroughProps } from './FieldWrapper'

export type SelectOption = {
  label: string
  value: string
  selected?: boolean
}

type SelectFieldProps = FieldWrapperPassThroughProps & {
  options: SelectOption[]
  className?: string
  placeholder?: string
  registration?: Partial<UseFormRegisterReturn>
  value?: string | number | boolean
  onChange?: (event: ChangeEvent<HTMLSelectElement>) => void
}

export const SelectField = ({
  label,
  options,
  error,
  className,
  registration,
  placeholder,
  value,
  ...props
}: SelectFieldProps) => {
  return (
    <FieldWrapper label={label} error={error}>
      <select
        placeholder={placeholder}
        name="location"
        value={value}
        className={clsx(
          'mt-1 block w-full rounded-md border border-secondary-600 py-2 pl-3 pr-10 text-body-sm focus:border-secondary-600 focus:outline-none focus:ring-secondary-900',
          className,
        )}
        {...registration}
        {...props}
      >
        {options.map(({ label, value, selected }) => {
          return (
            <option key={label?.toString()} value={value} selected={selected}>
              {label}
            </option>
          )
        })}
      </select>
    </FieldWrapper>
  )
}
