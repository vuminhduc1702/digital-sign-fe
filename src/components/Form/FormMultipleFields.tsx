import { zodResolver } from '@hookform/resolvers/zod'
import * as React from 'react'
import {
  useForm,
  type SubmitHandler,
  type UseFormProps,
  type FieldValues,
  useFieldArray,
  type UseFormReturn,
  type UseFieldArrayReturn,
  type ArrayPath,
} from 'react-hook-form'
import { type ZodType } from 'zod'

import { cn } from '~/utils/misc'

type FormProps<TFormValues extends FieldValues, Schema> = {
  onSubmit: SubmitHandler<TFormValues>
  children: (
    methods: UseFormReturn<TFormValues>,
    fieldArrayOneMethods: UseFieldArrayReturn<TFormValues>,
    fieldArrayTwoMethods: UseFieldArrayReturn<TFormValues>,
  ) => React.ReactNode
  options?: UseFormProps<TFormValues>
  schema?: Schema
  className?: string
  id?: string
  name: string[]
}

export const FormMultipleFields = <
  TFormValues extends Record<string, unknown> = Record<string, unknown>,
  Schema extends ZodType<unknown> = ZodType<unknown>,
>({
  onSubmit,
  children,
  className,
  options,
  id,
  schema,
  name,
}: FormProps<TFormValues, Schema>) => {
  const formMethods = useForm<TFormValues>({
    ...options,
    resolver: schema && zodResolver(schema),
  })

  const fieldArrayOneMethods = useFieldArray({
    name: name[0] as ArrayPath<TFormValues>,
    control: formMethods.control,
  })

  const fieldArrayTwoMethods = useFieldArray({
    name: name[1] as ArrayPath<TFormValues>,
    control: formMethods.control,
  })

  return (
    <form
      className={cn('w-full space-y-5', className)}
      onSubmit={formMethods.handleSubmit(onSubmit)}
      id={id}
    >
      {children(formMethods, fieldArrayOneMethods, fieldArrayTwoMethods)}
    </form>
  )
}