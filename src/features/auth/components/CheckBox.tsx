import { forwardRef } from 'react'
import { FieldError, type UseFormRegisterReturn } from 'react-hook-form'
import { cn } from '~/utils/misc'

const variants = {
  primary: 'bg-primary-400 text-white',
  secondary: 'bg-secondary-600',
  secondaryLight: 'bg-secondary-500',
  danger: 'bg-primary-400 text-white',
  trans: 'bg-transparent',
  muted: 'bg-white',
  none: 'bg-transparent shadow-none border-none',
}

const sizes = {
  sm: 'py-2 px-4 text-body-light',
  md: 'py-2 px-6 text-body-md',
  lg: 'py-3 px-8 text-body-md',
  square: 'py-2 px-2',
  'no-p': 'py-0',
}

type IconProps =
  | { startIcon: React.ReactElement; endIcon?: never }
  | { endIcon: React.ReactElement; startIcon?: never }
  | { endIcon?: undefined; startIcon?: undefined }

export type CheckBoxProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  type?: 'checkbox'
  label?: string
  className?: string
  classNameFieldWrapper?: string
  registration?: Partial<UseFormRegisterReturn>
  value?: string
  variant?: keyof typeof variants
  size?: keyof typeof sizes
  isLoading?: boolean
  error?: FieldError | undefined
  onChange?: (e: any) => void
} & IconProps

export const CheckBox = forwardRef(function CheckBox(
  props: CheckBoxProps,
  ref,
) {
  const {
    type = 'checkbox',
    value = '',
    id = 'terms',
    label,
    className,
    registration,
    error,
    startIcon,
    endIcon,
    ...prop
  } = props

  return (
    <>
      <div>
        {startIcon}
        <input
          id={id}
          type={type}
          value={value}
          className={cn(
            'h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600',
            className,
            //   { 'pl-9': startIcon, 'pr-9': endIcon },
          )}
        />
        <label
          htmlFor={id}
          className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
        >
          {label}
        </label>
        {endIcon}
      </div>
    </>
  )
})
