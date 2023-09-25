import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'

import { axios } from '~/lib/axios'
import { queryClient, type MutationConfig } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

type DeleteDashboardDTO = {
  id: string
}

export const deleteDashboard = ({ id }: DeleteDashboardDTO) => {
  return axios.delete(`/api/vtdashboard/${id}`)
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
      await queryClient.invalidateQueries(['dashboards'])
      addNotification({
        type: 'success',
        title: t('cloud:dashboard.add_dashboard.success_delete'),
      })
    },
    ...config,
    mutationFn: deleteDashboard,
  })
}
