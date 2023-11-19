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

type FormMultipleFieldsProps<TFormValues extends FieldValues, Schema> = {
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
  name: ArrayPath<TFormValues>[]
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
}: FormMultipleFieldsProps<TFormValues, Schema>) => {
  const formMethods = useForm<TFormValues>({
    ...options,
    resolver: schema && zodResolver(schema),
  })

  const fieldArrayOneMethods = useFieldArray({
    name: name[0],
    control: formMethods.control,
  })

  const fieldArrayTwoMethods = useFieldArray({
    name: name[1],
    control: formMethods.control,
  })

  return (
    <form
      className={cn('w-full space-y-5', className)}
      onSubmit={formMethods.handleSubmit(onSubmit)}
      id={id}
      autoComplete="off"
    >
      {children(formMethods, fieldArrayOneMethods, fieldArrayTwoMethods)}
    </form>
  )
}
