import { type ForwardedRef, forwardRef } from 'react'
import { type PropsValue } from 'react-select'
import { Controller, type FieldValues } from 'react-hook-form'

import { InputField } from './InputField'
import { cn } from '@/utils/misc'

import { type FieldWrapperPassThroughProps } from './FieldWrapper'
import { type ControllerPassThroughProps } from '@/types'

type FileFieldProps<TFormValues extends FieldValues> = {
  onChange?: (e: any) => void
  value?: PropsValue<any>
} & FieldWrapperPassThroughProps &
  ControllerPassThroughProps<TFormValues> &
  React.InputHTMLAttributes<HTMLInputElement>

const FileField = forwardRef<HTMLInputElement, FileFieldProps<FieldValues>>(
  function FileField<TFormValues extends FieldValues>(
    { name, control, ...props }: FileFieldProps<TFormValues>,
    ref: ForwardedRef<HTMLInputElement>,
  ) {
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
  },
)

export default FileField
