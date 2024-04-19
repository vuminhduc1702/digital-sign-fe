import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import type * as z from 'zod'

import { axios } from '@/lib/axios'
import { type MutationConfig, queryClient } from '@/lib/react-query'
import { toast } from 'sonner'

import { type FieldsList, type DataBase } from '../types'

export type CreateDataBaseDTO = {
  data: {
    table: string
    fields: FieldsList[]
    project_id?: string
  }
}
export const createDataBase = ({
  data,
}: CreateDataBaseDTO): Promise<DataBase> => {
  const dataSendBE = {
    fields: data.fields.map(item => ({
      ...item,
      is_pk: true,
    })),
  }
  return axios.post(
    `/api/fe/table/${data?.table}?project_id=${data?.project_id}`,
    dataSendBE,
  )
}

type UseCreateDataBaseOptions = {
  config?: MutationConfig<typeof createDataBase>
}

export const useCreateDataBase = ({
  config,
}: UseCreateDataBaseOptions = {}) => {
  const { t } = useTranslation()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['dataBases'],
      })
      toast.success(t('cloud:db_template.add_db.success_create'))
    },
    ...config,
    mutationFn: createDataBase,
  })
}
