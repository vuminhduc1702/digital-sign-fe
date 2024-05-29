import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import storage from '@/utils/storage'
import { useAddColumn, type AddColumnDTO } from '../api'

import btnCancelIcon from '@/assets/icons/btn-cancel.svg'
import btnDeleteIcon from '@/assets/icons/btn-delete.svg'
import btnSubmitIcon from '@/assets/icons/btn-submit.svg'
import { outputList } from '@/cloud/customProtocol/components/CreateService'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import i18n from '@/i18n'
import { cn } from '@/utils/misc'
import { nameSchema } from '@/utils/schemaValidation'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'

export const createColumnSchema = z.object({
  fields: z.array(
    z.object({
      name: nameSchema,
      type: z.string().min(1, { message: i18n.t('schema:value_type') }),
    }),
  ),
})

export default function CreateColumn({
  isSearch,
  isValidate,
  open,
  close,
  isOpen,
  onClose,
}: {
  isSearch?: boolean
  isValidate?: string
  open?: () => void
  close?: () => void
  isOpen?: boolean
  onClose?: () => void
}) {
  const { t } = useTranslation()

  const projectId = storage.getProject()?.id
  const { tableName } = useParams()

  const { mutate, isLoading, isSuccess } = useAddColumn()

  const form = useForm<AddColumnDTO['data']>({
    resolver: createColumnSchema && zodResolver(createColumnSchema),
    defaultValues: {
      fields: [{ name: '', type: '' }],
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
          <SheetTitle>{t('cloud:db_template.add_db.add_column')}</SheetTitle>
        </SheetHeader>
        <div className="max-h-[85%] min-h-[85%] overflow-y-auto pr-2">
          <Form {...form}>
            <form
              className="w-full space-y-5"
              id="create-database"
              onSubmit={handleSubmit(values => {
                mutate({
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
                      type: '',
                    })
                  }
                />
                {fields.map((field, index) => (
                  <section
                    key={field.id}
                    className="mt-3 flex justify-between gap-3 rounded-md bg-slate-200 px-2 py-4"
                  >
                    <div className="flex w-full gap-x-4 gap-y-2">
                      <FormField
                        control={form.control}
                        name={`fields.${index}.name`}
                        render={({ field }) => (
                          <FormItem className="w-1/2">
                            <FormLabel>
                              {t('cloud:db_template.add_db.column')}
                            </FormLabel>
                            <div>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`fields.${index}.type`}
                        render={({ field: { onChange, value, ...field } }) => (
                          <FormItem className="w-1/2">
                            <FormLabel>
                              {t('cloud:db_template.add_db.type')}
                            </FormLabel>
                            <div>
                              <FormControl>
                                <Select
                                  {...field}
                                  onValueChange={onChange}
                                  value={value}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white">
                                    {outputList?.map(
                                      (option: {
                                        value: string
                                        label: string
                                      }) => (
                                        <SelectItem
                                          key={option.value}
                                          value={option.value}
                                        >
                                          {option.label}
                                        </SelectItem>
                                      ),
                                    )}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                            </div>
                          </FormItem>
                        )}
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
