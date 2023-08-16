import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

export const deleteThing = ({ id }: { id: string }) => {
  return axios.delete(`/api/fe/thing/${id}`)
}

type UseDeleteThingOptions = {
  config?: MutationConfig<typeof deleteThing>
}

export const useDeleteThing = ({ config }: UseDeleteThingOptions = {}) => {
  const { t } = useTranslation()

  const { addNotification } = useNotificationStore()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries(['entity-things'])
      addNotification({
        type: 'success',
        title: t('cloud:custom_protocol.thing.success_delete'),
      })
    },
    ...config,
    mutationFn: deleteThing,
  })
}
