import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import type * as z from 'zod'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'
import { type TemplateLwM2M } from '../types'
import { type TransportConfig} from '~/utils/schemaValidation'

export type CreateTemplatelwm2mDTO = {
  data: {
    name: string
    rule_chain_id: string
    project_id: string
    transport_config: TransportConfig
  }
}
export const createTemplatelwm2m = ({
  data,
}: CreateTemplatelwm2mDTO): Promise<TemplateLwM2M> => {
  return axios.post(`/api/templates`, data)
}

type UseCreateTemplatelwm2mOptions = {
  config?: MutationConfig<typeof createTemplatelwm2m>
}

export const useCreateTemplatelwm2m = ({
  config,
}: UseCreateTemplatelwm2mOptions = {}) => {
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
    mutationFn: createTemplatelwm2m,
  })
}
