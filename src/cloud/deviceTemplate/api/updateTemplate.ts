import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import type * as z from 'zod'

import { axios } from '@/lib/axios'
import { type MutationConfig, queryClient } from '@/lib/react-query'
import { type TransportConfig } from '../types'
import { type AttrList } from '@/utils/schemaValidation'
import { toast } from 'sonner'

export type UpdateTemplateDTO = {
  data: {
    name: string
    rule_chain_id: string
    transport_config?: TransportConfig
    attributes?: AttrList
    thing_id: string
    thing_name: string
    handle_msg_svc: string
  }
  templateId: string
}

export const updateTemplate = ({ data, templateId }: UpdateTemplateDTO) => {
  return axios.put(`/api/templates/${templateId}`, data)
}

type UseUpdateTemplateOptions = {
  config?: MutationConfig<typeof updateTemplate>
  isOnCreateTemplate?: boolean
}

export const useUpdateTemplate = ({
  config,
  isOnCreateTemplate,
}: UseUpdateTemplateOptions = {}) => {
  const { t } = useTranslation()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['templates'] })
      await queryClient.invalidateQueries({ queryKey: ['attrs'] })
      !isOnCreateTemplate &&
        toast.success(t('cloud:device_template.add_template.success_update'))
    },
    ...config,
    mutationFn: updateTemplate,
  })
}
