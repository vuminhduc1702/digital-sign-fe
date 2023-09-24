import { forwardRef } from 'react'
import clsx from 'clsx'
import { type UseFormRegisterReturn } from 'react-hook-form'

import { FieldWrapper, type FieldWrapperPassThroughProps } from './FieldWrapper'

type IconProps =
  | { startIcon: React.ReactElement; endIcon?: never }
  | { endIcon: React.ReactElement; startIcon?: never }
  | { endIcon?: undefined; startIcon?: undefined }

type InputFieldProps = FieldWrapperPassThroughProps & {
  type?: 'text' | 'email' | 'password' | 'number' | 'file'
  className?: string
  registration?: Partial<UseFormRegisterReturn>
  value?: any
  onChange?: (e: any) => void
} & IconProps

export const InputField = forwardRef(function InputField(
  props: InputFieldProps,
  ref,
) {
  const {
    type = 'text',
    label,
    className,
    registration,
    error,
    startIcon,
    endIcon,
    ...prop
  } = props
  return (
    <FieldWrapper label={label} error={error}>
      {startIcon}
      <input
        type={type}
        className={clsx(
          'block w-full appearance-none rounded-md border border-secondary-600 px-3 py-2 text-black placeholder-secondary-700 shadow-sm focus:border-secondary-900 focus:outline-none focus:ring-secondary-900 disabled:cursor-not-allowed disabled:bg-secondary-500 sm:text-body-sm',
          className,
          { 'pl-7': startIcon, 'pr-7': endIcon },
        )}
        ref={ref}
        {...registration}
        {...prop}
      />
      {endIcon}
    </FieldWrapper>
  )
})
