import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import { axios } from '~/lib/axios'
import { type MutationConfig } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

type DeleteDashboardDTO = {
  projectId: string
  dashboardId: string
}

export const deleteDashboard = ({
  projectId,
  dashboardId,
}: DeleteDashboardDTO) => {
  return axios.delete(`/api/vtdashboard/${projectId}`, { data: dashboardId })
}

type UseDeleteDashboardOptions = {
  config?: MutationConfig<typeof deleteDashboard>
}

export const useDeleteDashboard = ({
  config,
}: UseDeleteDashboardOptions = {}) => {
  const { t } = useTranslation()

  const { addNotification } = useNotificationStore()

  return useMutation({
    onSuccess: async () => {
      addNotification({
        type: 'success',
        title: t('cloud:dashboard.add_dashboard.success_delete'),
      })
    },
    ...config,
    mutationFn: deleteDashboard,
  })
}
