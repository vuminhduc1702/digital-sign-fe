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
          'block w-full appearance-none rounded-md border border-secondary-600 px-3 py-2 placeholder-secondary-700 shadow-sm focus:border-secondary-900 focus:outline-none focus:ring-secondary-900 sm:text-body-sm',
          className,
          { 'pl-7': startIcon, 'pr-7': endIcon },
        )}
        {...registration}
      />
      {endIcon}
    </FieldWrapper>
  )
}
