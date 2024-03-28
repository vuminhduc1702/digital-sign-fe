import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import type * as z from 'zod'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { toast } from 'sonner'

import { type BaseAPIRes } from '~/types'
import { type entityThingSchema } from '~/cloud/flowEngineV2/components/Attributes'

type CreateEntityThingRes = {
  data: {
    id: string
    rowsAffected: 1 | (number & NonNullable<unknown>)
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

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['entity-things'],
      })
      toast.success(t('cloud:custom_protocol.thing.success_create'))
    },
    ...config,
    mutationFn: createEntityThing,
  })
}
