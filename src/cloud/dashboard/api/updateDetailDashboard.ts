import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

import { type Widgets } from '../types'

export type UpdateDetailDashboardDTO = {
  data: {
    title: string
    configuration: {
      description: string
      widgets: Widgets
    }
  }
  dashboardId: string
}

export const updateDetailDashboard = ({
  data,
  dashboardId,
}: UpdateDetailDashboardDTO) => {
  return axios.put(`/api/vtdashboard/${dashboardId}`, data)
}

export type UseUpdateDetailDashboardOptions = {
  config?: MutationConfig<typeof updateDetailDashboard>
}

export const useUpdateDetailDashboard = ({
  config,
}: UseUpdateDetailDashboardOptions = {}) => {
  const { t } = useTranslation()

  const { addNotification } = useNotificationStore()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries(['dashboards'])
      addNotification({
        type: 'success',
        title: t('cloud:dashboard.add_dashboard.success_update'),
      })
    },
    ...config,
    mutationFn: updateDetailDashboard,
  })
}
