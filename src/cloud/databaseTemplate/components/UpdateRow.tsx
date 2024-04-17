import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/Button'
import { Drawer } from '@/components/Drawer'
import { InputField } from '@/components/Form'

import { useParams } from 'react-router-dom'
import * as z from 'zod'
import btnCancelIcon from '@/assets/icons/btn-cancel.svg'
import btnSubmitIcon from '@/assets/icons/btn-submit.svg'
import storage from '@/utils/storage'
import { useUpdateRow, type UpdateRowDTO } from '../api/updateRow'
import { type FieldsRows } from '../types'

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
  const { register, formState, handleSubmit } = useForm<
    UpdateRowDTO['data']['dataSendBE']['filter']
  >({
    resolver: updateeRowsSchema && zodResolver(updateeRowsSchema),
    defaultValues: {
      ...row,
    },
  })

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
    <Drawer
      isOpen={isOpen}
      onClose={close}
      title={t('cloud:db_template.add_db.update_row')}
      renderFooter={() => (
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
      )}
    >
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
            <InputField
              label={item}
              error={formState?.errors?.[item]}
              registration={register(`${item}`)}
            />
          ))}
        </>
      </form>
    </Drawer>
  )
}
