import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'

import { axios } from '@/lib/axios'
import { type MutationConfig, queryClient } from '@/lib/react-query'
import { toast } from 'sonner'

import { type Dashboard } from '../components/DashboardTable'

export type UpdateDashboardDTO = {
  data: Omit<Dashboard, 'project_id'>
  dashboardId: string
}

export const updateDashboard = ({ data, dashboardId }: UpdateDashboardDTO) => {
  return axios.put(`/api/vtdashboard/${dashboardId}`, data)
}

export type UseUpdateDashboardOptions = {
  config?: MutationConfig<typeof updateDashboard>
}

export const useUpdateDashboard = ({
  config,
}: UseUpdateDashboardOptions = {}) => {
  const { t } = useTranslation()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries(['dashboards'])
      toast.success(t('cloud:dashboard.add_dashboard.success_update'))
    },
    ...config,
    mutationFn: updateDashboard,
  })
}
