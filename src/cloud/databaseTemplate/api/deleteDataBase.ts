import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { toast } from 'sonner'

export const deleteDataBase = ({ table, project_id }: { table: string, project_id: string }) => {
  return axios.delete(`/api/fe/table/${table}?project_id=${project_id}`)
}

type UseDeleteDataBaseOptions = {
  config?: MutationConfig<typeof deleteDataBase>
}

export const useDeleteDataBase = ({
  config,
}: UseDeleteDataBaseOptions = {}) => {
  const { t } = useTranslation()

  return useMutation({
    onSuccess: async () => {      
      toast.promise(() => queryClient.invalidateQueries(['dataBases']), {
        loading: t('loading:loading'),
        success: t('cloud:db_template.add_db.success_delete'),
        error: t('error:server_res.title'),
      })
    },
    ...config,
    mutationFn: deleteDataBase,
  })
}
