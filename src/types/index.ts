import { type FieldValues, type Control, type Path } from 'react-hook-form'
import type * as z from 'zod'

import { type BasePaginationSchema } from '~/utils/schemaValidation'

export type BaseEntity = {
  id: string
  created_by: string
  created_time: number
}

export type BasePagination = z.infer<typeof BasePaginationSchema>

export type BaseTablePagination = {
  offset: number
  setOffset?: React.Dispatch<React.SetStateAction<number>>
  total: number
  isPreviousData: boolean
}

export type BaseAPIRes = {
  code: 0 | number
  message: 'success' | string
}

export type BaseWSRes = {
  errorCode: number
  errorMsg: string
}

export type Attribute = {
  attribute_key: string
  logged: boolean
  value: string | number | boolean
  value_as_string?: string
  last_update_ts: number
  value_type: 'STR' | 'BOOL' | 'LONG' | 'DBL' | 'JSON'
}

export type GetEventHandlers<T extends keyof JSX.IntrinsicElements> = Extract<
  keyof JSX.IntrinsicElements[T],
  `on${string}`
>

/**
 * Provides the event type for a given element and handler.
 *
 * @example
 *
 * type MyEvent = EventFor<"input", "onChange">;
 */
export type EventFor<
  TElement extends keyof JSX.IntrinsicElements,
  THandler extends GetEventHandlers<TElement>,
> = JSX.IntrinsicElements[TElement][THandler] extends
  | ((e: infer TEvent) => any)
  | undefined
  ? TEvent
  : never

export type ControllerPassThroughProps<TFormValues extends FieldValues> = {
  name: Path<TFormValues>
  control?: Control<TFormValues, any>
}
