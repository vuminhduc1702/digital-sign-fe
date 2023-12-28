import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { toast } from 'sonner'
 
export const deleteAdapter = ({ id }: { id: string }) => {
  return axios.delete(`/api/adapter/${id}`)
}

type UseDeleteAdapterOptions = {
  config?: MutationConfig<typeof deleteAdapter>
}

export const useDeleteAdapter = ({ config }: UseDeleteAdapterOptions = {}) => {
  const { t } = useTranslation()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries(['adapters'])
      toast.success(t('cloud:custom_protocol.adapter.success_delete'))
    },
    ...config,
    mutationFn: deleteAdapter,
  })
}
