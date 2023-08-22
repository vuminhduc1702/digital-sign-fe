import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'

import { axios } from '~/lib/axios'
import { type MutationConfig } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

export type EntityType =
  | 'ORGANIZATION'
  | 'GROUP'
  | 'DEVICE'
  | 'USER'
  | 'TEMPLATE'
  | 'EVENT'


export type CreateDashboardDTO = {
  data: {
    title: string
    project_id: string,
    configuration: {
      description: string
    }
  }
}

type CreateDashboardRes = {
  
}

export const createDashboard = ({ data }: CreateDashboardDTO): Promise<CreateDashboardRes> => {
  return axios.post(`/api/vtdashboard`, data)
}

export type UseCreateDashboardOptions = {
  config?: MutationConfig<typeof createDashboard>
}

export const useCreateDashboard = ({ config }: UseCreateDashboardOptions = {}) => {
  const { t } = useTranslation()

  const { addNotification } = useNotificationStore()

  return useMutation({
    onSuccess: async () => {
      // await queryClient.invalidateQueries(['attrs'])
      // await queryClient.invalidateQueries(['deviceById'])
      addNotification({
        type: 'success',
        title: t('cloud:dashboard.add_dashboard.success_create'),
      })
    },
    ...config,
    mutationFn: createDashboard,
  })
}
