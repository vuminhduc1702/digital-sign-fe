import { forwardRef } from 'react'
import { type UseFormRegisterReturn } from 'react-hook-form'
import { cn } from '~/utils/misc'

import { FieldWrapper, type FieldWrapperPassThroughProps } from './FieldWrapper'

type IconProps = {
  startIcon?: React.ReactElement
  endIcon?: React.ReactElement
}

type InputFieldProps = FieldWrapperPassThroughProps & {
  type?: 'text' | 'email' | 'password' | 'number' | 'file'
  className?: string
  classnamefieldwrapper?: string
  registration?: Partial<UseFormRegisterReturn>
  classNameError?: string
  classlabel?: string
  classchild?: string
} & IconProps &
  React.InputHTMLAttributes<HTMLInputElement>

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  function InputField(
    {
      type = 'text',
      label,
      className,
      classnamefieldwrapper,
      registration,
      error,
      startIcon,
      endIcon,
      require,
      classNameError,
      classlabel,
      classchild,
      ...props
    }: InputFieldProps,
    ref,
  ) {
    return (
      <FieldWrapper
        label={label}
        error={error}
        require={require}
        classNameError={classNameError}
        classlabel={classlabel}
        classchild={classchild}
        className={cn(
          type === 'file'
            ? 'w-fit cursor-pointer bg-primary-400 px-2 py-1 text-white'
            : '',
          classnamefieldwrapper,
        )}
      >
        {startIcon}
        <input
          type={type}
          className={cn(
            'block w-full appearance-none rounded-md border border-secondary-600 px-3 py-2 text-black placeholder-secondary-700 shadow-sm focus:border-secondary-900 focus:outline-none focus:ring-secondary-900 disabled:cursor-not-allowed disabled:bg-secondary-500 sm:text-body-sm',
            className,
            { 'pl-8': startIcon, 'pr-8': endIcon },
          )}
          ref={ref}
          {...registration}
          {...props}
        />
        {endIcon}
      </FieldWrapper>
    )
  },
)
