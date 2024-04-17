import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'

import { axios } from '@/lib/axios'
import { queryClient, type MutationConfig } from '@/lib/react-query'
import { toast } from 'sonner'

import { type Dashboard } from '../components/DashboardTable'
import { type DashboardRes } from './getDashboards'

export type CreateDashboardDTO = {
  data: Dashboard
}

export const createDashboard = ({
  data,
}: CreateDashboardDTO): Promise<DashboardRes> => {
  return axios.post(`/api/vtdashboard`, data)
}

export type UseCreateDashboardOptions = {
  config?: MutationConfig<typeof createDashboard>
}

export const useCreateDashboard = ({
  config,
}: UseCreateDashboardOptions = {}) => {
  const { t } = useTranslation()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries(['dashboards'])
      toast.success(t('cloud:dashboard.add_dashboard.success_create'))
    },
    ...config,
    mutationFn: createDashboard,
  })
}
