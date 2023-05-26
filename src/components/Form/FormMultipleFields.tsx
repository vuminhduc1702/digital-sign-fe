import { zodResolver } from '@hookform/resolvers/zod'
import clsx from 'clsx'
import * as React from 'react'
import {
  useForm,
  type SubmitHandler,
  type UseFormProps,
  type FieldValues,
  useFieldArray,
  type FieldArrayWithId,
  type UseFieldArrayAppend,
  type ArrayPath,
  type UseFieldArrayRemove,
  type UseFormRegister,
  type FormState,
  type Control,
} from 'react-hook-form'
import { type ZodType } from 'zod'

type FormProps<TFormValues extends FieldValues, Schema> = {
  onSubmit: SubmitHandler<TFormValues>
  children: (
    register: UseFormRegister<TFormValues>,
    formState: FormState<TFormValues>,
    fields: FieldArrayWithId<TFormValues, ArrayPath<TFormValues>, 'id'>[],
    append: UseFieldArrayAppend<TFormValues, ArrayPath<TFormValues>>,
    remove: UseFieldArrayRemove,
    control?: Control<TFormValues, any>,
  ) => React.ReactNode
  options?: UseFormProps<TFormValues>
  schema?: Schema
  className?: string
  id?: string
  name: ArrayPath<TFormValues>
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
  const methods = useForm<TFormValues>({
    ...options,
    resolver: schema && zodResolver(schema),
  })
  const { register, formState, handleSubmit, control } = methods

  const { fields, append, remove } = useFieldArray({
    name,
    control,
  })

  return (
    <form
      className={clsx('w-full space-y-6', className)}
      onSubmit={handleSubmit(onSubmit)}
      id={id}
    >
      {children(
        register,
        formState,
        fields,
        append,
        remove,
        control,
      )}
    </form>
  )
}
