import { zodResolver } from '@hookform/resolvers/zod'
import * as React from 'react'
import {
  useForm,
  type UseFormReturn,
  type SubmitHandler,
  type UseFormProps,
  type FieldValues,
} from 'react-hook-form'
import { cn } from '~/utils/misc'

import { type ZodType } from 'zod'

type FormProps<TFormValues extends FieldValues, Schema> = {
  onSubmit: SubmitHandler<TFormValues>
  children: (methods: UseFormReturn<TFormValues>) => React.ReactNode
  options?: UseFormProps<TFormValues>
  schema?: Schema
  className?: string
  id?: string
}

export const Form = <
  TFormValues extends Record<string, unknown> = Record<string, unknown>,
  Schema extends ZodType<unknown> = ZodType<unknown>,
>({
  onSubmit,
  children,
  className,
  options,
  id,
  schema,
}: FormProps<TFormValues, Schema>) => {
  const methods = useForm<TFormValues>({
    ...options,
    resolver: schema && zodResolver(schema),
  })

  return (
    <form
      className={cn('w-full space-y-6', className)}
      onSubmit={methods.handleSubmit(onSubmit)}
      id={id}
    >
      {children(methods)}
    </form>
  )
}
