import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import type * as z from 'zod'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'
import storage from '~/utils/storage'
import { useGetEntityThings } from './getEntityThings'

import { type BaseAPIRes } from '~/types'
import { type entityThingSchema } from '../../components'

type CreateEntityThingRes = {
  data: {
    id: string
    rowsAffected: 1 | number
  }
} & BaseAPIRes

export type CreateEntityThingDTO = {
  data: z.infer<typeof entityThingSchema>
}

export const createEntityThing = ({
  data,
}: CreateEntityThingDTO): Promise<CreateEntityThingRes> => {
  return axios.post(`/api/fe/thing`, data)
}

type UseCreateEntityOptions = {
  config?: MutationConfig<typeof createEntityThing>
}

export const useCreateEntityThing = ({
  config,
}: UseCreateEntityOptions = {}) => {
  const { t } = useTranslation()

  const { addNotification } = useNotificationStore()

  const { id: projectId } = storage.getProject()
  const { refetch: refetchThingData } = useGetEntityThings({
    projectId,
    config: { enabled: false },
  })

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['entity-things'],
      })

      refetchThingData()

      addNotification({
        type: 'success',
        title: t('cloud:custom_protocol.thing.success_create'),
      })
    },
    ...config,
    mutationFn: createEntityThing,
  })
}
