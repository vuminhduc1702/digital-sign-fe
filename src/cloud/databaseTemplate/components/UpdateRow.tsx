import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { InputField } from '@/components/Form'

import { useParams } from 'react-router-dom'
import * as z from 'zod'
import btnCancelIcon from '@/assets/icons/btn-cancel.svg'
import btnSubmitIcon from '@/assets/icons/btn-submit.svg'
import storage from '@/utils/storage'
import { useUpdateRow, type UpdateRowDTO } from '../api/updateRow'
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

export const updateeRowsSchema = z.record(z.string())

type UpdateRowProps = {
  onClose: () => void
  close: () => void
  isOpen: boolean
  row: FieldsRows
}

export function UpdateRow({ onClose, close, isOpen, row }: UpdateRowProps) {
  const { t } = useTranslation()
  const projectId = storage.getProject()?.id
  const { tableName } = useParams()
  const [columns, setColumns] = useState<string[]>([])

  const { mutate, isLoading, isSuccess } = useUpdateRow()

  const form = useForm<UpdateRowDTO['data']['dataSendBE']['filter']>({
    resolver: updateeRowsSchema && zodResolver(updateeRowsSchema),
    defaultValues: {
      ...row,
    },
  })
  const { control, register, formState, handleSubmit } = form

  useEffect(() => {
    if (row) setColumns(Object.keys(row))
  }, [row])

  useEffect(() => {
    if (isSuccess) {
      close()
      onClose()
    }
  }, [isSuccess, close])

  return (
    <Sheet open={isOpen} onOpenChange={close} modal={false}>
      <SheetContent
        onInteractOutside={e => {
          e.preventDefault()
        }}
        className={cn('flex h-full max-w-xl flex-col justify-between')}
      >
        <SheetHeader>
          <SheetTitle>{t('cloud:db_template.add_db.update_row')}</SheetTitle>
        </SheetHeader>
        <div className="max-h-[85%] min-h-[85%] overflow-y-auto pr-2">
          <Form {...form}>
            <form
              id="update-dashboard"
              className="w-full space-y-6"
              onSubmit={handleSubmit(values => {
                mutate({
                  data: {
                    table: tableName || '',
                    dataSendBE: {
                      values,
                      filter: {
                        ...row,
                      },
                    },
                    project_id: projectId,
                  },
                })
              })}
            >
              <>
                {columns?.map(item => (
                  <FormField
                    control={form.control}
                    name={item}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{item}</FormLabel>
                        <div>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
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
              onClick={close}
              startIcon={
                <img src={btnCancelIcon} alt="Submit" className="h-5 w-5" />
              }
            />
            <Button
              className="rounded border-none"
              form="update-dashboard"
              type="submit"
              size="lg"
              isLoading={isLoading}
              disabled={!formState.isDirty || isLoading}
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
