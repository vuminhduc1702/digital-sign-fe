import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import type * as z from 'zod'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

import { type Template } from '../types'
import { type attrListSchema } from '~/utils/schemaValidation'
export type CreateTemplateDTO = {
  data: {
    name: string
    rule_chain_id: string
    project_id: string
    attributes: z.infer<typeof attrListSchema>
  }
}
export const createTemplate = ({
  data,
}: CreateTemplateDTO): Promise<Template> => {

//data.rule_chain_id = "8e3e2070-8ccb-11ee-8f7f-4fb365099215"

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
