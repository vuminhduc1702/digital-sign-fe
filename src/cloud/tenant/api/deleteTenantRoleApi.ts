import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { axios } from '@/lib/axios'
import { type MutationConfig, queryClient } from '@/lib/react-query'
import { toast } from 'sonner'

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

export const useDeleteCustomerRole = ({
  config,
}: UseDeleteCustomerRoleOptions = {}) => {
  const { t } = useTranslation()

  return useMutation({
    onSuccess: async () => {
      toast.promise(
        () => queryClient.invalidateQueries(['call-customer-list-api']),
        {
          loading: t('loading:loading'),
          success: t('cloud:role_manage.add_role.success_delete'),
          error: t('error:server_res.title'),
        },
      )
    },
    ...config,
    mutationFn: deleteCustomerRole,
  })
}
