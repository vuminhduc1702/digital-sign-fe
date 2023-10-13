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
}

export type FieldWrapperPassThroughProps = Omit<
  FieldWrapperProps,
  'className' | 'children'
>

export const FieldWrapper = (props: FieldWrapperProps) => {
  const { label, className, error, children, require, classNameError } = props
  return (
    <div className="relative w-full">
      <label
        className={cn('block text-body-sm', { 'space-y-1': label }, className)}
      >
        {require ? (
          <p>
            {label} <span className="text-primary-400">*</span>
          </p>
        ) : (
          <p className={cn('', { 'w-2/12': label && className })}>{label}</p>
        )}
        <div className={cn('', { 'w-10/12': label && className })}>{children}</div>
      </label>
      {error?.message && (
        <div
          role="alert"
          aria-label={error.message}
          className={cn('mt-1 text-body-sm text-primary-400', classNameError)}
        >
          {error.message}
        </div>
      )}
    </div>
  )
}
