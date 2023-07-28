import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

export const deleteAdapter = ({ id }: { id: string }) => {
  return axios.delete(`/api/adapter/${id}`)
}

type UseDeleteAdapterOptions = {
  config?: MutationConfig<typeof deleteAdapter>
}

export const useDeleteAdapter = ({ config }: UseDeleteAdapterOptions = {}) => {
  const { t } = useTranslation()

  const { addNotification } = useNotificationStore()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries(['adapters'])
      addNotification({
        type: 'success',
        title: t('cloud:custom_protocol.adapter.success_delete'),
      })
    },
    ...config,
    mutationFn: deleteAdapter,
  })
}
