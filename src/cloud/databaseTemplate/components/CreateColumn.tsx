import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import * as z from 'zod'

import { Button } from '@/components/Button'
import { InputField } from '@/components/Form'
import storage from '@/utils/storage'
import { useAddColumn, type AddColumnDTO } from '../api'

import { useParams } from 'react-router-dom'
import btnCancelIcon from '@/assets/icons/btn-cancel.svg'
import btnDeleteIcon from '@/assets/icons/btn-delete.svg'
import btnSubmitIcon from '@/assets/icons/btn-submit.svg'
import { PlusIcon } from '@/components/SVGIcons'
import { nameSchema } from '@/utils/schemaValidation'
import { useEffect } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/Tooltip'
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

export const createColumnSchema = z.object({
  fields: z.array(
    z.object({
      name: nameSchema,
    }),
  ),
})

export default function CreateColumn({
  isSearch,
  isValidate,
  open,
  close,
  isOpen,
}: {
  isSearch?: boolean
  isValidate?: string
  open?: () => void
  close?: () => void
  isOpen?: boolean
}) {
  const { t } = useTranslation()

  const projectId = storage.getProject()?.id
  const { tableName } = useParams()

  const { mutateAsync, isLoading, isSuccess } = useAddColumn()

  const { register, formState, watch, handleSubmit, control, reset } = useForm<
    AddColumnDTO['data']
  >({
    resolver: createColumnSchema && zodResolver(createColumnSchema),
    defaultValues: {
      table: '',
      fields: [{ name: '' }],
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
          <SheetTitle>{t('cloud:db_template.add_db.add_column')}</SheetTitle>
        </SheetHeader>
        <div className="max-h-[85%] min-h-[85%] overflow-y-auto pr-2">
          <form
            className="w-full space-y-5"
            id="create-database"
            onSubmit={handleSubmit(async values => {
              mutateAsync({
                data: {
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
                  })
                }
              />
              {fields.map((field, index) => (
                <section
                  key={field.id}
                  className="mt-3 flex justify-between gap-3 rounded-md bg-slate-200 px-2 py-4"
                >
                  <div className="grid w-full grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-1">
                    <InputField
                      label={t('cloud:db_template.add_db.column')}
                      error={formState?.errors?.fields?.[index]?.name}
                      registration={register(`fields.${index}.name` as const)}
                    />
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
