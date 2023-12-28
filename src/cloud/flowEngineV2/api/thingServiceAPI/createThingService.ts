import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import type * as z from 'zod'

import { axios } from '~/lib/axios'
import { queryClient, type MutationConfig } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

import { type BaseAPIRes } from '~/types'
import { type serviceThingSchema } from '../../components/ThingService'

type CreateServiceThingRes = {
  data: 1 | number
} & BaseAPIRes

export type CreateServiceThingDTO = {
  data: z.infer<typeof serviceThingSchema>
  thingId: string
  name?: string
}

export const createServiceThing = ({
  data,
  thingId,
}: CreateServiceThingDTO): Promise<CreateServiceThingRes> => {
  return axios.post(`/api/fe/thing/${thingId}/service`, data)
}

type UseCreateServiceOptions = {
  config?: MutationConfig<typeof createServiceThing>
}

export const useCreateServiceThing = ({
  config,
}: UseCreateServiceOptions = {}) => {
  const { t } = useTranslation()

  const { addNotification } = useNotificationStore()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['service-things'],
      })
      addNotification({
        type: 'success',
        title: t('cloud:custom_protocol.service.success_create'),
      })
    },
    ...config,
    mutationFn: createServiceThing,
  })
}
