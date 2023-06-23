import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

import { type TemplateAttributesDTO } from './createTemplate'

export type UpdateTemplateDTO = {
  data: {
    name: string
    attributes?: TemplateAttributesDTO[]
  }
  templateId: string
}

export const updateTemplate = ({ data, templateId }: UpdateTemplateDTO) => {
  return axios.put(`/api/templates/${templateId}`, data)
}

type UseUpdateTemplateOptions = {
  config?: MutationConfig<typeof updateTemplate>
}

export const useUpdateTemplate = ({
  config,
}: UseUpdateTemplateOptions = {}) => {
  const { t } = useTranslation()

  const { addNotification } = useNotificationStore()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['templates'] })
      await queryClient.invalidateQueries({ queryKey: ['attrs'] })
      addNotification({
        type: 'success',
        title: t('cloud:device_template.add_template.success_update'),
      })
    },
    ...config,
    mutationFn: updateTemplate,
  })
}
