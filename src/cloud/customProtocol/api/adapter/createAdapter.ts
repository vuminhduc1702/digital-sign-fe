import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import type * as z from 'zod'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { toast } from 'sonner'

import { type adapterSchema } from '../../components'

import { type Adapter } from '../../types'

export type CreateAdapterDTO = {
  data: z.infer<typeof adapterSchema>
}

export const createAdapter = ({ data }: CreateAdapterDTO): Promise<Adapter> => {
  return axios.post(`/api/adapter`, data)
}

type UseCreateAdapterOptions = {
  config?: MutationConfig<typeof createAdapter>
}

export const useCreateAdapter = ({ config }: UseCreateAdapterOptions = {}) => {
  const { t } = useTranslation()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['adapters'],
      })
      toast.success(t('cloud:custom_protocol.adapter.success_create'))
    },
    ...config,
    mutationFn: createAdapter,
  })
}
