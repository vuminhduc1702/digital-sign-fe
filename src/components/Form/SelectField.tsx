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
  const redBorderError =
    error?.message != null ? 'border-primary-400 focus:outline-primary-400' : ''
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
          'border-secondary-600 text-body-sm focus:outline-focus-400 focus:ring-focus-400 disabled:bg-secondary-500 mt-1 block w-full rounded-md border py-2 pl-3 pr-10 focus:outline-2 disabled:cursor-not-allowed',
          redBorderError,
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
