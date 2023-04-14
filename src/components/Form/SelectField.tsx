import clsx from 'clsx'
import * as React from 'react'
import { type UseFormRegisterReturn } from 'react-hook-form'

import { FieldWrapper, type FieldWrapperPassThroughProps } from './FieldWrapper'

type Option = {
  label: React.ReactNode
  value: string | number | string[]
}

type SelectFieldProps = FieldWrapperPassThroughProps & {
  options: Option[]
  className?: string
  defaultValue?: string
  placeholder?: string
  registration: Partial<UseFormRegisterReturn>
}

export const SelectField = (props: SelectFieldProps) => {
  const {
    label,
    options,
    error,
    className,
    defaultValue,
    registration,
    placeholder,
  } = props
  return (
    <FieldWrapper label={label} error={error}>
      <select
        placeholder={placeholder}
        name="location"
        className={clsx(
          'mt-1 block w-full rounded-md border-secondary-600 py-2 pl-3 pr-10 text-base focus:border-secondary-600 focus:outline-none focus:ring-secondary-900 sm:text-body-sm',
          className,
        )}
        defaultValue={defaultValue}
        {...registration}
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
