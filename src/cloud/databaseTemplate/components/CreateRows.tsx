import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import * as z from 'zod'

import { Button } from '@/components/Button'
import { InputField } from '@/components/Form'
import storage from '@/utils/storage'
import { useAddColumn, useCreateDataBase, type AddColumnDTO } from '../api'

import { nameSchema } from '@/utils/schemaValidation'
import btnCancelIcon from '@/assets/icons/btn-cancel.svg'
import btnDeleteIcon from '@/assets/icons/btn-delete.svg'
import btnSubmitIcon from '@/assets/icons/btn-submit.svg'
import { PlusIcon } from '@/components/SVGIcons'
import { useParams } from 'react-router-dom'
import { type AddRowsDTO, useAddRows } from '../api/addRows'
import { useEffect, useState } from 'react'
import { type FieldsRows } from '../types'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/utils/misc'

export const createRowsSchema = z.object({
  fields: z.array(z.record(z.string())),
})

export default function CreateRows({
  columnsProp,
  open,
  close,
  isOpen,
}: {
  columnsProp: string[]
  open?: () => void
  close?: () => void
  isOpen?: boolean
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

  const { register, formState, watch, handleSubmit, control, reset } = useForm<
    AddRowsDTO['dataSendBE']
  >({
    resolver: createRowsSchema && zodResolver(createRowsSchema),
    defaultValues: {
      table: '',
      fields: [defaultValues],
    },
  })
  const { fields, append, remove } = useFieldArray({
    name: 'fields',
    control,
  })

  useEffect(() => {
    if (isSuccess) close && close()
  }, [isSuccess])
  return (
    <Sheet open={isOpen} onOpenChange={close} modal={false}>
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
              close && close()
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
                onClick={() => append(defaultValues)}
              />
              {fields.map((field, index) => (
                <section
                  key={field.id}
                  className="mt-3 flex justify-between gap-3 rounded-md bg-slate-200 px-2 py-4"
                >
                  <div className="grid w-full grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-3">
                    {columnsProp?.map(item => (
                      <InputField
                        label={item}
                        error={formState?.errors?.fields?.[index]?.item}
                        registration={register(
                          `fields.${index}.${item}` as const,
                        )}
                      />
                    ))}
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
        </div>

        <SheetFooter>
          <>
            <Button
              className="rounded border-none"
              variant="secondary"
              size="lg"
              onClick={close}
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
