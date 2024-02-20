import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { toast } from 'sonner'
import { axios } from '~/lib/axios'
import { queryClient, type MutationConfig } from '~/lib/react-query'

import { type FieldsRows } from '../types'

export type UpdateRowDTO = {
  data: {
    table: string
    dataSendBE: {
      values: FieldsRows
      filter: FieldsRows
    }
    project_id?: string
  }
}

export const updateRow = ({ data }: UpdateRowDTO) => {
  let keys = Object.keys(data?.dataSendBE?.filter)
  const dataFilter = keys.map(item => ({
    [item]: data?.dataSendBE?.filter[item],
  }))
  const dataSendBE = {
    values: data?.dataSendBE?.values,
    filter: {
      $and: dataFilter,
    },
  }
  return axios.put(
    `/api/fe/table/${data?.table}/update?project_id=${data?.project_id}`,
    dataSendBE,
  )
}

type UseUpdateRowOptions = {
  config?: MutationConfig<typeof updateRow>
  isOnCreateTemplate?: boolean
}

export const useUpdateRow = ({ config }: UseUpdateRowOptions = {}) => {
  const { t } = useTranslation()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['select-dataBases'],
      })
      toast.success(t('cloud:db_template.add_db.success_update_row'))
    },
    ...config,
    mutationFn: updateRow,
  })
}
