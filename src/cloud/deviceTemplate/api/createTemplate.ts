import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()

  const { addNotification } = useNotificationStore()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['templates'],
      })
      addNotification({
        type: 'success',
        title: t('cloud:device_template.add_template.success_create'),
      })
    },
    ...config,
    mutationFn: createTemplate,
  })
}
