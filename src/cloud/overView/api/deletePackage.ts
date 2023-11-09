import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

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

  const { addNotification } = useNotificationStore()
  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries(['plans'])
      addNotification({
        type: 'success',
        title: t('billing:package_manage.popup.success_delete'),
      })
    },
    ...config,
    mutationFn: deletePlan,
  })
}
