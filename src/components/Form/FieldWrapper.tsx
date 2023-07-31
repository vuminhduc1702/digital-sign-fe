import clsx from 'clsx'
import * as React from 'react'
import { type FieldError } from 'react-hook-form'

type FieldWrapperProps = {
  label?: string
  className?: string
  children: React.ReactNode
  error?: FieldError | undefined
  description?: string
  disabled?: boolean
}

export type FieldWrapperPassThroughProps = Omit<
  FieldWrapperProps,
  'className' | 'children'
>

export const FieldWrapper = (props: FieldWrapperProps) => {
  const { label, className, error, children } = props
  return (
    <div className="relative w-full">
      <label
        className={clsx(
          'block text-body-sm',
          { 'space-y-1': label },
          className,
        )}
      >
        <p>{label}</p>
        <div>{children}</div>
      </label>
      {error?.message && (
        <div
          role="alert"
          aria-label={error.message}
          className="text-body-sm text-primary-400"
        >
          {error.message}
        </div>
      )}
    </div>
  )
}
