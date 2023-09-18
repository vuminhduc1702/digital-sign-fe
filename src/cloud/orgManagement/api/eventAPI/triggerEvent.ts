import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { axios } from '~/lib/axios'
import { queryClient, type MutationConfig } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

export type TriggerEventDTO = {
  data: {
    event_id: string
    project_id: string
  }
}

export const triggerEvent = ({ data }: TriggerEventDTO) => {
  console.log(data)

  return axios.post(
    `/api/events/${data.event_id}/activate?project_id=${data.project_id}`,
  )
}

type UseTriggerEventOptions = {
  config?: MutationConfig<typeof triggerEvent>
}

export const useTriggerEvent = ({ config }: UseTriggerEventOptions = {}) => {
  const { t } = useTranslation()

  const { addNotification } = useNotificationStore()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['events'],
      })
      addNotification({
        type: 'success',
        title: t('cloud:org_manage.event_manage.add_event.success_create'),
      })
    },
    ...config,
    mutationFn: triggerEvent,
  })
}
