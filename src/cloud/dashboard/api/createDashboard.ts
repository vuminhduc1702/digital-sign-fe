import { Dashboard } from './../types/index';
import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'

import { axios } from '~/lib/axios'
import { queryClient, type MutationConfig } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

export type CreateDashboardDTO = {
  data: {
    title: string
    project_id: string
    configuration: {
      description: string
    }
  }
}

type CreateDashboardRes = {
  dashboard: Dashboard
}

export const createDashboard = ({
  data,
}: CreateDashboardDTO): Promise<CreateDashboardRes> => {
  return axios.post(`/api/vtdashboard`, data)
}

export type UseCreateDashboardOptions = {
  config?: MutationConfig<typeof createDashboard>
}

export const useCreateDashboard = ({
  config,
}: UseCreateDashboardOptions = {}) => {
  const { t } = useTranslation()

  const { addNotification } = useNotificationStore()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries(['dashboards'])
      addNotification({
        type: 'success',
        title: t('cloud:dashboard.add_dashboard.success_create'),
      })
    },
    ...config,
    mutationFn: createDashboard,
  })
}
