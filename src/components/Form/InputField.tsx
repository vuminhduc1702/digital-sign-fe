import clsx from 'clsx'
import { type UseFormRegisterReturn } from 'react-hook-form'

import { FieldWrapper, type FieldWrapperPassThroughProps } from './FieldWrapper'

type IconProps =
  | { startIcon: React.ReactElement; endIcon?: never }
  | { endIcon: React.ReactElement; startIcon?: never }
  | { endIcon?: undefined; startIcon?: undefined }

type InputFieldProps = FieldWrapperPassThroughProps & {
  type?: 'text' | 'email' | 'password'
  className?: string
  registration?: Partial<UseFormRegisterReturn>
} & IconProps

export const InputField = (props: InputFieldProps) => {
  const {
    type = 'text',
    label,
    className,
    registration,
    error,
    startIcon,
    endIcon,
  } = props
  return (
    <FieldWrapper label={label} error={error}>
      {startIcon}
      <input
        type={type}
        className={clsx(
          'block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm',
          className,
          { 'pl-7': startIcon, 'pr-7': endIcon },
        )}
        {...registration}
      />
      {endIcon}
    </FieldWrapper>
  )
}
