import Select from 'react-select'
import { Controller, type Control, type FieldValues } from 'react-hook-form'

import { type SelectOption } from './SelectField'

type SelectMultipleProps<TFormValues extends FieldValues> = {
  options: SelectOption[]
  name: string
  control?: Control<TFormValues, any>
}

export function SelectMultiple<TFormValues extends FieldValues>({
  options,
  name,
  control,
}: SelectMultipleProps<TFormValues>) {
  return (
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
            className="basic-multi-select"
            classNamePrefix="select"
          />
        )
      }}
    />
  )
}
