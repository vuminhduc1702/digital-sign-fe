import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

export const deleteThingService = ({ thingId, name }: { thingId: string, name: string }) => {
  return axios.delete(`/api/fe/thing/${thingId}/service/${name}`)
}

type ThingServiceDeleteUserOptions = {
  config?: MutationConfig<typeof deleteThingService>
}

export const useDeleteThingService = ({ config }: ThingServiceDeleteUserOptions = {}) => {
  const { t } = useTranslation()

  const { addNotification } = useNotificationStore()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries(['service-things'])
      addNotification({
        type: 'success',
        title: t('cloud:custom_protocol.service.success_delete'),
      })
    },
    ...config,
    mutationFn: deleteThingService,
  })
}
