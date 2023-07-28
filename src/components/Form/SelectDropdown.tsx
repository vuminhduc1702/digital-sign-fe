import Select from 'react-select'
import { Controller, type Control, type FieldValues } from 'react-hook-form'

import { FieldWrapper, type FieldWrapperPassThroughProps } from './FieldWrapper'
import { type SelectOption } from './SelectField'

export type ControllerPassThroughProps<TFormValues extends FieldValues> = {
  name?: string
  control?: Control<TFormValues, any>
}

type SelectProps<TFormValues extends FieldValues> = {
  options: SelectOption[]
  closeMenuOnSelect?: boolean
  isMulti?: boolean
  onMenuClose?: () => void
  onMenuOpen?: () => void
  isOptionDisabled?: (option: SelectOption) => boolean
  noOptionsMessage?: () => string
  defaultValue?: { label: string | undefined; value: string }[] | null
} & FieldWrapperPassThroughProps &
  ControllerPassThroughProps<TFormValues>

export function SelectDropdown<TFormValues extends FieldValues>({
  options,
  name,
  control,
  label,
  error,
  ...props
}: SelectProps<TFormValues>) {
  return (
    <FieldWrapper label={label} error={error}>
      <Controller
        control={control}
        // @ts-expect-error
        name={name}
        render={({ field }) => {
          return (
            <Select
              {...field}
              isClearable
              isSearchable
              // @ts-expect-error
              options={options}
              {...props}
            />
          )
        }}
      />
    </FieldWrapper>
  )
}
