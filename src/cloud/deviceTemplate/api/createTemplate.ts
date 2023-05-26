import { useMutation } from '@tanstack/react-query'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

import { type Template } from '../types'

export type TemplateAttributesDTO = {
  attribute_key: string
  logged: boolean
  value_t: string
  value?: string | undefined
}

export type CreateTemplateDTO = {
  data: {
    name: string
    project_id: string
    attributes: TemplateAttributesDTO[]
  }
}

export const createTemplate = ({
  data,
}: CreateTemplateDTO): Promise<Template> => {
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
