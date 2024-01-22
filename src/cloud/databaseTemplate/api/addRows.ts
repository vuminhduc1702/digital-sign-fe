import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import type * as z from 'zod'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { toast } from 'sonner'

import { type AttrList } from '~/utils/schemaValidation'
import { type FieldsRows } from '../types'

export type AddRowsDTO = {
  dataSendBE: {
    table: string
    fields: FieldsRows[]
    project_id?: string
  }
}

export const addRows = ({ dataSendBE }: AddRowsDTO) => {
  let fields = Object.keys(dataSendBE?.fields[0])
  let data = dataSendBE?.fields?.map((x) => {
    let items = []
    for (let k of fields) {
      items.push(x[k])
    }
    return items
  })
  let result = { fields, data }
  return axios.post(
    `/api/fe/table/${dataSendBE?.table}/insert/batch?project_id=${dataSendBE.project_id}`,
    result,
  )
}

type UseAddRowsOptions = {
  config?: MutationConfig<typeof addRows>
  isOnCreateTemplate?: boolean
}

export const useAddRows = ({ config }: UseAddRowsOptions = {}) => {
  const { t } = useTranslation()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['select-dataBases'],
      })
      toast.success(t('cloud:db_template.add_db.success_add_column'))
    },
    ...config,
    mutationFn: addRows,
  })
}
