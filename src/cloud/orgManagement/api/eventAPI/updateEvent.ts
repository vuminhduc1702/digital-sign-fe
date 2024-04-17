import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { axios } from '@/lib/axios'
import { type MutationConfig, queryClient } from '@/lib/react-query'
import { toast } from 'sonner'
import { type z } from 'zod'
import { type createEventSchema } from '../../components/Event'

export type UpdateEventDTO = {
  data: z.infer<typeof createEventSchema> & {
    org_id: string
    group_id: string
    type?: string
    schedule?: any
    interval?: any
  }
  eventId: string
}

export const updateEvent = ({ data, eventId }: UpdateEventDTO) => {
  const typeEvent = data?.type
  if (typeEvent === 'event') {
    delete data?.schedule
  } else {
    delete data?.interval
  }
  delete data?.type

  return axios.put(
    `/api/events${typeEvent === 'schedule' ? '/schedule' : ''}/${eventId}`,
    data,
  )
}

type UseUpdateEventOptions = {
  config?: MutationConfig<typeof updateEvent>
}

export const useUpdateEvent = ({ config }: UseUpdateEventOptions = {}) => {
  const { t } = useTranslation()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['events'],
      })
      toast.success(t('cloud:org_manage.event_manage.add_event.success_update'))
    },
    ...config,
    mutationFn: updateEvent,
  })
}
