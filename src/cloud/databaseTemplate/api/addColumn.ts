import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import type * as z from 'zod'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { toast } from 'sonner'

import { type AttrList } from '~/utils/schemaValidation'
import { type FieldsColumn } from '../types'

export type AddColumnDTO = {
  data: {
    table: string
    fields: FieldsColumn[]
    project_id?: string
  }
}

export const addColumn = ({ data }: AddColumnDTO) => {
  const dataSendBE = {
    updates: data.fields.map(item => ({
      type: 'add',
      field: {
        name: item.name,
      },
    })),
  }
  console.log(dataSendBE, 'hsahahahah')
  return axios.put(
    `/api/fe/table/${data?.table}?project_id=${data?.project_id}`,
    dataSendBE,
  )
}

type UseAddColumnOptions = {
  config?: MutationConfig<typeof addColumn>
  isOnCreateTemplate?: boolean
}

export const useAddColumn = ({
  config,
  isOnCreateTemplate,
}: UseAddColumnOptions = {}) => {
  const { t } = useTranslation()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['select-dataBases'],
      })
      toast.success(t('cloud:db_template.add_db.success_add_column'))
    },
    ...config,
    mutationFn: addColumn,
  })
}
