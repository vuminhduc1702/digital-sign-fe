import Select, { type PropsValue } from 'react-select'
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from 'react-hook-form'

import { FieldWrapper, type FieldWrapperPassThroughProps } from './FieldWrapper'
import { type SelectOption } from './SelectField'

export type ControllerPassThroughProps<TFormValues extends FieldValues> = {
  name?: Path<TFormValues>
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
  defaultValue?: PropsValue<SelectOption> | undefined
  placeholder?: string
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
        name={name}
        render={({ field }) => {
          return (
            <Select
              {...field}
              isClearable
              isSearchable
              options={options}
              {...props}
            />
          )
        }}
      />
    </FieldWrapper>
  )
}
