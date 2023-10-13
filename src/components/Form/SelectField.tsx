import { type UseFormRegisterReturn } from 'react-hook-form'
import { type ChangeEvent } from 'react'

import { FieldWrapper, type FieldWrapperPassThroughProps } from './FieldWrapper'
import { cn } from '~/utils/misc'

export type SelectOption = {
  label: string
  value: string | number
  selected?: boolean
}

export type SelectOptionString = {
  label: string
  value: string
  selected?: boolean
}

type SelectFieldProps = FieldWrapperPassThroughProps & {
  options: SelectOption[]
  className?: string
  placeholder?: string
  registration?: Partial<UseFormRegisterReturn>
  value?: string | number
  onChange?: (event: ChangeEvent<HTMLSelectElement>) => void
  classnamefieldwrapper?: string
}

export const SelectField = ({
  label,
  options,
  error,
  className,
  registration,
  placeholder,
  value,
  require,
  classnamefieldwrapper,
  ...props
}: SelectFieldProps) => {
  return (
    <FieldWrapper className={cn('', classnamefieldwrapper)} require={require} label={label} error={error}>
      <select
        placeholder={placeholder}
        value={value}
        className={cn(
          'mt-1 block w-full rounded-md border border-secondary-600 py-2 pl-3 pr-10 text-body-sm focus:border-secondary-600 focus:outline-none focus:ring-secondary-900 disabled:cursor-not-allowed disabled:bg-secondary-500',
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
