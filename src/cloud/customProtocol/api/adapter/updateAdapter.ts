import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

export type UpdateAdapterDTO = {
  data: {
    name: string
  }
  adapterId: string
}

export const updateAdapter = ({ data, adapterId }: UpdateAdapterDTO) => {
  return axios.put(`/api/adapter/${adapterId}`, data)
}

type UseUpdateAdapterOptions = {
  config?: MutationConfig<typeof updateAdapter>
}

export const useUpdateAdapter = ({ config }: UseUpdateAdapterOptions = {}) => {
  const { t } = useTranslation()

  const { addNotification } = useNotificationStore()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['adapters'],
      })
      addNotification({
        type: 'success',
        title: t('cloud:custom_protocol.adapter.success_update'),
      })
    },
    ...config,
    mutationFn: updateAdapter,
  })
}
