import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import type * as z from 'zod'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'


type TransportConfig = {
    protocol: string
    config: { [key: string]: string }
    info: null | undefined
}
export type UpdateTemplatelwm2mDTO = {
  data: {
    name: string
    rule_chain_id: string
    transport_config?: TransportConfig
  }
  templateId: string
}

export const updateTemplatelwm2m = ({ data, templateId }: UpdateTemplatelwm2mDTO) => {
  return axios.put(`/api/templates/${templateId}`, data)
}

type UseUpdateTemplateOptions = {
  config?: MutationConfig<typeof updateTemplatelwm2m>
  isOnCreateTemplate?: boolean
}

export const useUpdateTemplatelwm2m = ({
  config,
  isOnCreateTemplate,
}: UseUpdateTemplateOptions = {}) => {
  const { t } = useTranslation()

  const { addNotification } = useNotificationStore()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['templates'] })
      await queryClient.invalidateQueries({ queryKey: ['attrs'] })
      !isOnCreateTemplate &&
      addNotification({
        type: 'success',
        title: t('cloud:device_template.add_template.success_update'),
      })
    },
    ...config,
    mutationFn: updateTemplatelwm2m,
  })
}