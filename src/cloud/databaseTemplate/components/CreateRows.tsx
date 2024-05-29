import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import storage from '@/utils/storage'

import btnCancelIcon from '@/assets/icons/btn-cancel.svg'
import btnDeleteIcon from '@/assets/icons/btn-delete.svg'
import btnSubmitIcon from '@/assets/icons/btn-submit.svg'
import { PlusIcon } from '@/components/SVGIcons'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/utils/misc'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAddRows, type AddRowsDTO } from '../api/addRows'
import { type FieldsRows } from '../types'
import { Checkbox } from '@/components/ui/checkbox'

export const createRowsSchema = z.object({
  fields: z.array(
    z.record(z.string().or(z.boolean()).or(z.number()).optional()),
  ),
})

export const numberInput = ['real', 'integer', 'bigint']

export default function CreateRows({
  columnsProp,
  open,
  close,
  isOpen,
  onClose,
  columnsType,
}: {
  columnsProp: string[]
  open?: () => void
  close?: () => void
  isOpen?: boolean
  onClose: () => void
  columnsType: string[]
}) {
  const { t } = useTranslation()

  const projectId = storage.getProject()?.id
  const { tableName } = useParams()
  const [defaultValues, setDefaultValues] = useState<FieldsRows>({})

  const { mutateAsync, isLoading, isSuccess } = useAddRows()

  useEffect(() => {
    const result: FieldsRows = {}
    columnsProp?.map(item => (result[item] = ''))
    setDefaultValues(result)
  }, [columnsProp])

  const form = useForm<AddRowsDTO['dataSendBE']>({
    resolver: createRowsSchema && zodResolver(createRowsSchema),
    defaultValues: {
      table: '',
      fields: [defaultValues],
    },
  })
  const { control, handleSubmit, reset } = form
  const { fields, append, remove } = useFieldArray({
    name: 'fields',
    control,
  })

  useEffect(() => {
    if (isSuccess && close) {
      close()
      onClose?.()
    }
  }, [isSuccess])

  const renderType = (type: string) => {
    let result = ''
    switch (type) {
      case 'boolean':
        return (result = 'Boolean')
      case 'real':
        return (result = 'f64')
      case 'character varying':
        return (result = 'String')
      case 'integer':
        return (result = 'i32')
      case 'bigint':
        return (result = 'i64')
      case 'jsonb':
        return (result = 'JSON')
    }
    return result
  }

  return (
    <Sheet
      open={isOpen}
      onOpenChange={() => {
        close?.()
        reset()
      }}
      modal={false}
    >
      <SheetContent
        onInteractOutside={e => {
          e.preventDefault()
        }}
        className={cn('flex h-full max-w-xl flex-col justify-between')}
      >
        <SheetHeader>
          <SheetTitle>{t('cloud:db_template.add_db.add_row')}</SheetTitle>
        </SheetHeader>
        <div className="max-h-[85%] min-h-[85%] overflow-y-auto pr-2">
          <Form {...form}>
            <form
              className="w-full space-y-5"
              id="create-database"
              onSubmit={handleSubmit(async values => {
                mutateAsync({
                  dataSendBE: {
                    project_id: projectId,
                    table: tableName || '',
                    fields: values.fields,
                  },
                })
              })}
            >
              <>
                <Button
                  className="h-9 w-9 rounded-md"
                  variant="trans"
                  size="square"
                  startIcon={
                    <PlusIcon width={16} height={16} viewBox="0 0 16 16" />
                  }
                  onClick={() =>
                    append({
                      name: '',
                      type: '',
                    })
                  }
                />
                {fields.map((field, index) => (
                  <section
                    key={field.id}
                    className="mt-3 flex justify-between gap-3 rounded-md bg-slate-200 px-2 py-4"
                  >
                    <div className="grid w-full grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-3">
                      {columnsProp?.map((item, i) => {
                        return (
                          <>
                            {columnsType[i] === 'boolean' ? (
                              <FormField
                                control={form.control}
                                name={`fields.${index}.${item}`}
                                render={({
                                  field: { onChange, value, ...field },
                                }) => (
                                  <FormItem>
                                    <FormLabel>
                                      {item} {`(${renderType(columnsType[i])})`}
                                    </FormLabel>
                                    <div>
                                      <FormControl>
                                        <Checkbox
                                          {...field}
                                          checked={value as boolean}
                                          onCheckedChange={onChange}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </div>
                                  </FormItem>
                                )}
                              />
                            ) : (
                              <FormField
                                control={form.control}
                                name={`fields.${index}.${item}`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>
                                      {item} {`(${renderType(columnsType[i])})`}
                                    </FormLabel>
                                    <div>
                                      <FormControl>
                                        <Input
                                          type={
                                            numberInput.includes(columnsType[i])
                                              ? 'number'
                                              : 'text'
                                          }
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </div>
                                  </FormItem>
                                )}
                              />
                            )}
                          </>
                        )
                      })}
                    </div>
                    <Button
                      type="button"
                      size="square"
                      variant="trans"
                      className="mt-3 border-none"
                      onClick={() => remove(index)}
                      startIcon={
                        <img
                          src={btnDeleteIcon}
                          alt="Delete device template"
                          className="h-8 w-8"
                        />
                      }
                    />
                  </section>
                ))}
              </>
            </form>
          </Form>
        </div>

        <SheetFooter>
          <>
            <Button
              className="rounded border-none"
              variant="secondary"
              size="lg"
              onClick={() => {
                close?.()
                reset()
              }}
              startIcon={
                <img src={btnCancelIcon} alt="Submit" className="h-5 w-5" />
              }
            />
            <Button
              className="rounded border-none"
              form="create-database"
              type="submit"
              isLoading={isLoading}
              size="lg"
              startIcon={
                <img src={btnSubmitIcon} alt="Submit" className="h-5 w-5" />
              }
            />
          </>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
