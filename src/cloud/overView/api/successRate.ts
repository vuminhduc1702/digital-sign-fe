import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { axios } from '~/lib/axios'
import { queryClient, type MutationConfig } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

export type SuccessRateDTO = {
  projectId: string
  method?: string
  url?: string
}

export type SuccessRateData = {
  success_rate: number
  total_request: number
}

export const SuccessRate = ({
  projectId,
  method,
  url,
}: SuccessRateDTO): Promise<SuccessRateData> => {
  return axios.post(`/api/overviews/successrate`, {
    project_id: projectId,
    method,
    url,
  })
}

type UseSuccessRateOptions = {
  config?: MutationConfig<typeof SuccessRate>
}

export const useSuccessRate = ({ config }: UseSuccessRateOptions = {}) => {
  const { t } = useTranslation()

  const { addNotification } = useNotificationStore()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['success-rate'],
      })
    },
    ...config,
    mutationFn: SuccessRate,
  })
}
