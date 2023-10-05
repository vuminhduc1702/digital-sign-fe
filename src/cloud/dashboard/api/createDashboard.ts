import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'

import { axios } from '~/lib/axios'
import { queryClient, type MutationConfig } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

import { type Dashboard } from '../components/DashboardTable'

export type CreateDashboardDTO = {
  data: Dashboard
}

type CreateDashboardRes = {
  id: string
  name: string
  created_time: number
  title: string
  tenant_id: string
  configuration: Dashboard['configuration']
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
