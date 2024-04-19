import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'

import { axios } from '@/lib/axios'
import { queryClient, type MutationConfig } from '@/lib/react-query'
import { toast } from 'sonner'

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

  return useMutation({
    onSuccess: async () => {
      toast.promise(() => queryClient.invalidateQueries(['dashboards']), {
        loading: t('loading:loading'),
        success: t('cloud:dashboard.add_dashboard.success_delete'),
        error: t('error:server_res.title'),
      })
    },
    ...config,
    mutationFn: deleteDashboard,
  })
}
