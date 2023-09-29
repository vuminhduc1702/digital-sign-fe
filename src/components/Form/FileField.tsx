import { forwardRef } from 'react'
import { type PropsValue } from 'react-select'
import { Controller, type FieldValues } from 'react-hook-form'

import { type FieldWrapperPassThroughProps } from './FieldWrapper'
import { InputField } from './InputField'

import { type ControllerPassThroughProps } from './SelectDropdown'
import { cn } from '~/utils/misc'

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
      render={({ field: { value, ...field } }) => {
        return (
          <InputField
            {...field}
            {...props}
            type="file"
            className={cn('mt-2 border-none p-0 shadow-none')}
            ref={ref}
          />
        )
      }}
    />
  )
})

export default FileField
