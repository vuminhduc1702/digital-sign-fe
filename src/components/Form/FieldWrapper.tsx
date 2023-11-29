import * as React from 'react'

import { cn } from '~/utils/misc'

import { type FieldError } from 'react-hook-form'

type FieldWrapperProps = {
  label?: string
  className?: string
  children: React.ReactNode
  error?: FieldError | undefined
  description?: string
  disabled?: boolean
  require?: boolean
  classNameError?: string
  classlabel?: string
  classchild?: string
}

export type FieldWrapperPassThroughProps = Omit<
  FieldWrapperProps,
  'className' | 'children'
>

export const FieldWrapper = (props: FieldWrapperProps) => {
  const {
    label,
    className,
    error,
    children,
    require,
    classNameError,
    classlabel,
    classchild,
  } = props
  return (
    <div className="relative w-full">
      <label
        className={cn('text-body-sm block', { 'space-y-1': label }, className)}
      >
        {require ? (
          <p>
            {label} <span className="text-primary-400">*</span>
          </p>
        ) : (
          <p className={cn('', classlabel)}>{label}</p>
        )}
        <div className={cn('', classchild)}>{children}</div>
      </label>
      {error?.message && (
        <div
          role="alert"
          aria-label={error.message}
          className={cn('text-body-sm text-primary-400 mt-1', classNameError)}
        >
          {error.message}
        </div>
      )}
    </div>
  )
}
