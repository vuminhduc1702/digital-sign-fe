import { forwardRef } from 'react'
import { type PropsValue } from 'react-select'
import { Controller, type FieldValues } from 'react-hook-form'

import { type FieldWrapperPassThroughProps } from './FieldWrapper'
import { InputField } from './InputField'

import { type ControllerPassThroughProps } from './SelectDropdown'

type FileFieldProps<TFormValues extends FieldValues> = {
  onChange?: (e: any) => void
  value?: PropsValue<any>
} & FieldWrapperPassThroughProps &
  ControllerPassThroughProps<TFormValues>

const FileField = forwardRef(function FileField<
  TFormValues extends FieldValues,
>({ name, control, ...props }: FileFieldProps<TFormValues>, ref: any) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange, ...field } }) => {
        return (
          <InputField
            {...field}
            {...props}
            type="file"
            className="border-none shadow-none"
            ref={ref}
            onChange={event => {
              console.log('wtf: ', event.target.files[0])
              onChange(event.target.files[0])
            }}
            value={value?.fileName}
          />
        )
      }}
    />
  )
})

export default FileField
