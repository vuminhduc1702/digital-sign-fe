import { forwardRef } from 'react'
import { type UseFormRegisterReturn } from 'react-hook-form'
import { cn } from '@/utils/misc'

import { FieldWrapper, type FieldWrapperPassThroughProps } from './FieldWrapper'
import { useTranslation } from 'react-i18next'

type IconProps = {
  startIcon?: React.ReactElement
  endIcon?: React.ReactElement
}

type InputFieldProps = FieldWrapperPassThroughProps & {
  type?: 'text' | 'email' | 'password' | 'number' | 'file' | 'time'
  className?: string
  classnamefieldwrapper?: string
  registration?: Partial<UseFormRegisterReturn>
  classNameError?: string
  classlabel?: string
  classchild?: string
  min?: number
} & IconProps &
  React.InputHTMLAttributes<HTMLInputElement>
//
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
      placeholder,
      min,
      ...props
    }: InputFieldProps,
    ref,
  ) {
    const { t } = useTranslation()

    return (
      <FieldWrapper
        label={label}
        error={error}
        require={require}
        classNameError={classNameError}
        classlabel={classlabel}
        classchild={classchild}
        className={cn(
          type === 'file' &&
            'w-fit cursor-pointer bg-primary-400 px-2 py-1 text-white',
          classnamefieldwrapper,
        )}
      >
        {startIcon}
        <input
          type={type}
          className={cn(
            'block w-full appearance-none rounded-md border border-secondary-600 px-3 py-2 text-black placeholder-secondary-700 shadow-sm focus:outline-2 focus:outline-focus-400 focus:ring-focus-400 disabled:cursor-not-allowed disabled:bg-secondary-500',
            {
              'pl-8': startIcon,
              'pr-8': endIcon,
              'border-primary-400 focus:outline-primary-400':
                error?.message != null,
            },
            className,
          )}
          ref={ref}
          placeholder={placeholder ?? t('placeholder:input_text')}
          {...registration}
          {...props}
          min={min}
        />
        {endIcon}
      </FieldWrapper>
    )
  },
)
