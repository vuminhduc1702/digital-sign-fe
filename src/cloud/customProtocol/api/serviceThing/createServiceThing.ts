import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import type * as z from 'zod'

import { axios } from '@/lib/axios'
import { type MutationConfig, queryClient } from '@/lib/react-query'
import { toast } from 'sonner'

import { type BaseAPIRes } from '@/types'
import { type serviceThingSchema } from '../../components'

type CreateServiceThingRes = {
  data: 1 | (number & NonNullable<unknown>)
} & BaseAPIRes

export type CreateServiceThingDTO = {
  data: z.infer<typeof serviceThingSchema>
  thingId: string
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

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['service-things'],
      })
      toast.success(t('cloud:custom_protocol.service.success_create'))
    },
    ...config,
    mutationFn: createServiceThing,
  })
}
