import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

import { type EventType } from '../../types'

const createEventSchema = z.object({
  project_id: z.string(),
  org_id: z.string().optional(),
  group_id: z.string().optional(),
  name: z.string(),
  onClick: z.boolean(),
  condition: z.array(
    z.object({
      device_id: z.string(),
      attribute_name: z.string(),
      condition_type: z.enum(['normal', 'delay'] as const),
      operator: z.enum(['<', '>', '!='] as const),
      threshold: z.string(),
      logical_operator: z.enum(['and', 'or'] as const),
    }),
  ),
  internal: z.object({
    monday: z.boolean().optional(),
    tuesday: z.boolean().optional(),
    wednesday: z.boolean().optional(),
    thursday: z.boolean().optional(),
    friday: z.boolean().optional(),
    saturday: z.boolean().optional(),
    sunday: z.boolean().optional(),
    start_time: z.string(),
    end_time: z.string(),
  }),
  action: z
    .array(
      z.discriminatedUnion('action_type', [
        z.object({
          action_type: z.literal('email'),
          receiver: z.string(),
          subject: z.string(),
          message: z.string(),
        }),
        z.object({
          action_type: z.literal('eventactive'),
          receiver: z.string(),
          subject: z.string().optional(),
          message: z.string().optional(),
        }),
        z.object({
          action_type: z.enum(['sms', 'mqtt', 'fcm', 'event'] as const),
          receiver: z.string(),
          subject: z.string().optional(),
          message: z.string(),
        }),
      ]),
    )
    .optional(),
  status: z.boolean().optional(),
  retry: z.number().optional(),
})

export type CreateEventDTO = {
  data: z.infer<typeof createEventSchema>
}

export const createEvent = ({ data }: CreateEventDTO): Promise<EventType> => {
  return axios.post(`/api/events`, data)
}

type UseCreateEventOptions = {
  config?: MutationConfig<typeof createEvent>
}

export const useCreateEvent = ({ config }: UseCreateEventOptions = {}) => {
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
    mutationFn: createEvent,
  })
}
