import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'
import { type z } from 'zod'
import { type createEventSchema } from '../../components/Event'

export type UpdateEventDTO = {
  data: z.infer<typeof createEventSchema> & {
    org_id: string | boolean
    group_id: string | boolean
    type?: string
    schedule?: any
    interval?: any
  }
  eventId: string
}

export const updateEvent = ({ data, eventId }: UpdateEventDTO) => {
    const typeEvent = data?.type
  if(typeEvent === 'event') {
    delete data?.schedule
  } else {
    delete data?.interval
  }
  delete data?.type;
  
  return axios.put(`/api/events${typeEvent === 'schedule' ? '/schedule' : ''}/${eventId}`, data)
}

type UseUpdateEventOptions = {
  config?: MutationConfig<typeof updateEvent>
}

export const useUpdateEvent = ({ config }: UseUpdateEventOptions = {}) => {
  const { t } = useTranslation()

  const { addNotification } = useNotificationStore()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['events'],
      })
      addNotification({
        type: 'success',
        title: t('cloud:org_manage.device_manage.add_device.success_update'),
      })
    },
    ...config,
    mutationFn: updateEvent,
  })
}
