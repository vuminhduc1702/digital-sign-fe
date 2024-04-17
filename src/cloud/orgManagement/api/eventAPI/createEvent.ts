import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { type z } from 'zod'

import { axios } from '@/lib/axios'
import { type MutationConfig, queryClient } from '@/lib/react-query'
import { toast } from 'sonner'
import { type createEventSchema } from '../../components/Event'

import { type EventType } from '../../types'

export type CreateEventDTO = {
  data: z.infer<typeof createEventSchema>
}

export const createEvent = ({ data }: CreateEventDTO): Promise<EventType> => {
  const typeEvent = data?.type
  if (typeEvent === 'event') {
    delete data?.schedule
  }
  delete data?.type

  return axios.post(
    `/api/events${typeEvent === 'schedule' ? '/schedule' : ''}`,
    data,
  )
}

type UseCreateEventOptions = {
  config?: MutationConfig<typeof createEvent>
}

export const useCreateEvent = ({ config }: UseCreateEventOptions = {}) => {
  const { t } = useTranslation()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['events'],
      })
      toast.success(t('cloud:org_manage.event_manage.add_event.success_create'))
    },
    ...config,
    mutationFn: createEvent,
  })
}
