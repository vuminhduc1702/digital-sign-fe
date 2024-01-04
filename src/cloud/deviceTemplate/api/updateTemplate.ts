import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import type * as z from 'zod'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
<<<<<<< HEAD
import { useNotificationStore } from '~/stores/notifications'
import { type TransportConfig } from '../types'
=======
import { toast } from 'sonner'

>>>>>>> 99332750fa8524ea7e81fb0aeebf32949138a7cd
import { type AttrList} from '~/utils/schemaValidation'

export type UpdateTemplateDTO = {
  data: {
    name: string
    rule_chain_id: string
    transport_config?: TransportConfig
    attributes?: AttrList
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