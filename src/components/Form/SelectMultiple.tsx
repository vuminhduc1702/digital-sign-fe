import Select from 'react-select'
import { Controller, type Control, type FieldValues } from 'react-hook-form'

import { FieldWrapper, type FieldWrapperPassThroughProps } from './FieldWrapper'
import { type SelectOption } from './SelectField'

type SelectMultipleProps<TFormValues extends FieldValues> = {
  options: SelectOption[]
  name: string
  control: Control<TFormValues, any>
} & FieldWrapperPassThroughProps

export function SelectMultiple<TFormValues extends FieldValues>({
  options,
  name,
  control,
  label,
  error,
}: SelectMultipleProps<TFormValues>) {
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
              isMulti
              options={options}
              closeMenuOnSelect={false}
            />
          )
        }}
      />
    </FieldWrapper>
  )
}
