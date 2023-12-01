import { forwardRef } from 'react'
import { type UseFormRegisterReturn } from 'react-hook-form'
import { cn } from '~/utils/misc'

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
      placeholder,
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
            'bg-primary-400 w-fit cursor-pointer px-2 py-1 text-white',
          classnamefieldwrapper,
        )}
      >
        {startIcon}
        <input
          type={type}
          className={cn(
            'border-secondary-600 placeholder-secondary-700 focus:outline-focus-400 focus:ring-focus-400 disabled:bg-secondary-500 block w-full appearance-none rounded-md border px-3 py-2 text-black shadow-sm focus:outline-2 disabled:cursor-not-allowed',
            className,
            { 'pl-8': startIcon, 'pr-8': endIcon },
          )}
          ref={ref}
          placeholder={placeholder ?? t('placeholder:input_text')}
          {...registration}
          {...props}
        />
        {endIcon}
      </FieldWrapper>
    )
  },
)
