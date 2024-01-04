import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import type * as z from 'zod'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { toast } from 'sonner'

import { type Template, type TransportConfig } from '../types'
import { type AttrList} from '~/utils/schemaValidation'

export type CreateTemplateDTO = {
  data: {
    name: string
    rule_chain_id: string
    project_id: string
    transport_config: TransportConfig
    attributes: AttrList
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

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['templates'],
      })
      toast.success(t('cloud:device_template.add_template.success_create'))
    },
    ...config,
    mutationFn: createTemplate,
  })
}
