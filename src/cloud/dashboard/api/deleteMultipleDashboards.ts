import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { toast } from 'sonner'

export type deleteEntityMultipleDashboardsDTO = {
  data: {
    ids: string[]
  }
}

export const deleteMultipleDashboards = (
  data: deleteEntityMultipleDashboardsDTO,
) => {
  return axios.delete(`/api/vtdashboard/remove/list`, data)
}

type UseDeleteMultipleDashboardOptions = {
  config?: MutationConfig<typeof deleteMultipleDashboards>
}

export const useDeleteMultipleDashboards = ({
  config,
}: UseDeleteMultipleDashboardOptions = {}) => {
  const { t } = useTranslation()

  return useMutation({
    onSuccess: async () => {
      toast.promise(() => queryClient.invalidateQueries(['dashboards']), {
        loading: t('loading:loading'),
        success: t('cloud:dashboard.add_dashboard.success_delete'),
        error: t('error:server_res.title'),
      })
    },
    ...config,
    mutationFn: deleteMultipleDashboards,
  })
}
