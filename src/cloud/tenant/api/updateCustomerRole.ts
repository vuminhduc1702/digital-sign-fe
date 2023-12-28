import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import type * as z from 'zod'
import { axios } from '~/lib/axios'
import { queryClient, type MutationConfig } from '~/lib/react-query'
import { toast } from 'sonner'

export type UpdateEntityCustomerRoleDTO = {
  data: {
    tenant_id: string
    project_id: string
    role_id: string
  }
}

export const updateCustomerRole = ({ data }: UpdateEntityCustomerRoleDTO) => {
  return axios.post(`/api/tenant/permission`, data)
}

type UseUpdateCustomerRoleOptions = {
  config?: MutationConfig<typeof updateCustomerRole>
}

export const useUpdateCustomerRole = ({
  config,
}: UseUpdateCustomerRoleOptions = {}) => {
  const { t } = useTranslation()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['call-customer-list-api'],
      })
      toast.success(t('form:customer.success_update_role')) 
    },
    ...config,
    mutationFn: updateCustomerRole,
  })
}
