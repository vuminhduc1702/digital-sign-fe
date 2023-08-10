import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

export type UpdateThingDTO = {
  data: {
    name: string
    description: string
  }
  thingId: string
}

export const updateThing = ({ data, thingId }: UpdateThingDTO) => {
  return axios.put(`/api/fe/thing/${thingId}`, data)
}

type UseUpdateThingOptions = {
  config?: MutationConfig<typeof updateThing>
}

export const useUpdateThing = ({ config }: UseUpdateThingOptions = {}) => {
  const { t } = useTranslation()

  const { addNotification } = useNotificationStore()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['entity-things'],
      })
      addNotification({
        type: 'success',
        title: t('cloud:custom_protocol.thing.success_update'),
      })
    },
    ...config,
    mutationFn: updateThing,
  })
}
