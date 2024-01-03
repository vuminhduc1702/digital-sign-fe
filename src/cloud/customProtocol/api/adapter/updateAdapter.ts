import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import type * as z from 'zod'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { toast } from 'sonner' 

import { type adapterSchema } from '../../components'

export type UpdateAdapterDTO = {
  data: z.infer<typeof adapterSchema>
  id: string
}

export const updateAdapter = ({ data, id }: UpdateAdapterDTO) => {
  return axios.put(`/api/adapter/${id}`, data)
}

type UseUpdateAdapterOptions = {
  config?: MutationConfig<typeof updateAdapter>
}

export const useUpdateAdapter = ({ config }: UseUpdateAdapterOptions = {}) => {
  const { t } = useTranslation()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['adapters'],
      })
      toast.success(t('cloud:custom_protocol.adapter.success_update'))
    },
    ...config,
    mutationFn: updateAdapter,
  })
}
