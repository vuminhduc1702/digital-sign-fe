import { type UseFormRegisterReturn } from 'react-hook-form'

import { FieldWrapper, type FieldWrapperPassThroughProps } from './FieldWrapper'
import { cn } from '~/utils/misc'

import { useTranslation } from 'react-i18next'

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

export type SelectOptionGeneric<T> = {
  label: string
  value: T
  selected?: boolean
}

type SelectFieldProps = FieldWrapperPassThroughProps & {
  options?: SelectOption[]
  className?: string
  placeholder?: string
  noDataPlaceholder?: string
  registration?: Partial<UseFormRegisterReturn>
  value?: string | number
  classnamefieldwrapper?: string
  classlabel?: string
  classchild?: string
} & React.SelectHTMLAttributes<HTMLSelectElement>

export const SelectField = ({
  label,
  options,
  error,
  className,
  registration,
  placeholder,
  noDataPlaceholder,
  value,
  require,
  classnamefieldwrapper,
  classlabel,
  classchild,
  ...props
}: SelectFieldProps) => {
  const { t } = useTranslation()

  return (
    <FieldWrapper
      classlabel={classlabel}
      classchild={classchild}
      className={cn('', classnamefieldwrapper)}
      require={require}
      label={label}
      error={error}
    >
      <select
        value={value}
        className={cn(
          'mt-1 block w-full rounded-md border border-secondary-600 py-2 pl-3 pr-10 text-body-sm focus:outline-2 focus:outline-focus-400 focus:ring-focus-400 disabled:cursor-not-allowed disabled:bg-secondary-500',
          className,
        )}
        {...registration}
        {...props}
      >
        <option value="" disabled selected hidden>
          {placeholder || t('placeholder:select')}
        </option>
        {options != null ? (
          options.map(({ label, value, selected }) => {
            return (
              <option key={label} value={value} selected={selected}>
                {label}
              </option>
            )
          })
        ) : (
          <option value="" disabled>
            {noDataPlaceholder || t('error:no_data')}
          </option>
        )}
      </select>
    </FieldWrapper>
  )
}
