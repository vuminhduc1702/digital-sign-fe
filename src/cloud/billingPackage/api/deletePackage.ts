import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { toast } from 'sonner'

export const deletePlan = ({ id }: { id: string }) => {
  return axios.delete(`/api/priceplan/plan/${id}`)
}

type UseDeletePlanOptions = {
  config?: MutationConfig<typeof deletePlan>
}

export const useDeletePlan = ({
  config,
}: UseDeletePlanOptions = {}) => {
  const { t } = useTranslation()

  return useMutation({
    onSuccess: async () => {
      toast.promise(() => queryClient.invalidateQueries(['plans']), {
        loading: t('loading:loading'),
        success: t('billing:package_manage.popup.success_delete'),
        error: t('error:server_res.title'),
      })
    },
    ...config,
    mutationFn: deletePlan,
  })
}
