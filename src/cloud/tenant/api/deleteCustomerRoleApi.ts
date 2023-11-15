import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

export const deleteCustomerRole = ({
  project_id,
  sub_tenant_id,
}: {
  project_id: string
  sub_tenant_id: string
}) => {
  return axios.delete(`/api/tenant/${sub_tenant_id}/project/${project_id}`)
}

type UseDeleteCustomerRoleOptions = {
  config?: MutationConfig<typeof deleteCustomerRole>
}

export const useDeleteCustomerRole = ({ config }: UseDeleteCustomerRoleOptions = {}) => {
  const { t } = useTranslation()

  const { addNotification } = useNotificationStore()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries(['call-customer-list-api'])
      addNotification({
        type: 'success',
        title: t('cloud:role_manage.add_role.success_delete'),
      })
    },
    ...config,
    mutationFn: deleteCustomerRole,
  })
}
