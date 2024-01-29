import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { toast } from 'sonner'

export const deleteRow = ({
  table,
  project_id,
  data,
}: {
  table: string
  project_id: string
  data: {
    filter: {
      [key: string]: any
    }
  }
}) => {
  return axios.delete(`/api/fe/table/${table}/delete?project_id=${project_id}`, {data})
}

type UseDeleteRowOptions = {
  config?: MutationConfig<typeof deleteRow>
}

export const useDeleteRow = ({ config }: UseDeleteRowOptions = {}) => {
  const { t } = useTranslation()

  return useMutation({
    onSuccess: async () => {
      toast.promise(() => queryClient.invalidateQueries(['select-dataBases']), {
        loading: t('loading:loading'),
        success: t('cloud:db_template.add_db.success_delete_row'),
        error: t('error:server_res.title'),
      })
    },
    ...config,
    mutationFn: deleteRow,
  })
}
