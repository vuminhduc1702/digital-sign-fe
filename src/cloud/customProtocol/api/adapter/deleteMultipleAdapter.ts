import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { axios } from '@/lib/axios'
import { type MutationConfig, queryClient } from '@/lib/react-query'
import { toast } from 'sonner'

export type deleteEntityMultipleAdaptersDTO = {
  data: {
    ids: string[]
  }
}

export const deleteMultipleAdapters = (
  data: deleteEntityMultipleAdaptersDTO,
) => {
  return axios.delete(`/api/adapter/remove/list`, data)
}

type UseDeleteMultipleAdapterOptions = {
  config?: MutationConfig<typeof deleteMultipleAdapters>
}

export const useDeleteMultipleAdapters = ({
  config,
}: UseDeleteMultipleAdapterOptions = {}) => {
  const { t } = useTranslation()

  return useMutation({
    onSuccess: async () => {
      toast.promise(() => queryClient.invalidateQueries(['adapters']), {
        loading: t('loading:loading'),
        success: t('cloud:custom_protocol.adapter.success_delete'),
        error: t('error:server_res.title'),
      })
    },
    ...config,
    mutationFn: deleteMultipleAdapters,
  })
}
