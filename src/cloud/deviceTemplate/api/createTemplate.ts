import { useMutation } from '@tanstack/react-query'
import type * as z from 'zod'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'
import { type templateSchema } from '../components'

export type CreateTemplateDTO = {
  data: z.infer<typeof templateSchema>
}

type CreateTemplateRes = {
  id: string
  name: string
  rule_chain_id?: string
  provision_key: string
  provision_secret: string
  created_time: number
}

export const createTemplate = ({
  data,
}: CreateTemplateDTO): Promise<CreateTemplateRes> => {
  return axios.post(`/api/templates`, data)
}

type UseCreateTemplateOptions = {
  config?: MutationConfig<typeof createTemplate>
}

export const useCreateTemplate = ({
  config,
}: UseCreateTemplateOptions = {}) => {
  const { addNotification } = useNotificationStore()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['templates'],
      })
      addNotification({
        type: 'success',
        title: 'Tạo mẫu thiết bị thành công',
      })
    },
    ...config,
    mutationFn: createTemplate,
  })
}
