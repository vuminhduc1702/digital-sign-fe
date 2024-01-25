import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { axios } from '~/lib/axios'
import { queryClient, type MutationConfig } from '~/lib/react-query'
import { type FieldsRows } from '../types'

export type DataSelectTable = {
  data: {
    columns: string[]
    rows: [][]
  }
}

export const selectDataBase = ({
  table,
  project_id,
  data,
}: {
  table: string
  project_id: string
  data?: {
    struct_scan: boolean
    limit: number | null
    filter: FieldsRows
  }
}): Promise<DataSelectTable> => {
  return axios.post(`/api/fe/table/${table}/select?project_id=${project_id}`, data)
}

type UseSelectDataBaseOptions = {
  config?: MutationConfig<typeof selectDataBase>
}

export const useSelectDataBase = ({
  config,
}: UseSelectDataBaseOptions = {}) => {
  const { t } = useTranslation()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['select-dataBases'],
      })
      // toast.success(t('cloud:db_template.add_db.success_create'))
    },
    ...config,
    mutationFn: selectDataBase,
  })
}
