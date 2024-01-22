import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { toast } from 'sonner'

export type UpdateCustomerDTO = {
  data: {
    name: string
    email: string
    phone: string
    password: string
  }
  customerId: string
}

export const updateCustomer = ({ data, customerId }: UpdateCustomerDTO) => {
  return axios.put(`/api/tenant/${customerId}`, data)
}

type UseUpdateCustomerOptions = {
  config?: MutationConfig<typeof updateCustomer>
}

export const useUpdateCustomer = ({
  config,
}: UseUpdateCustomerOptions = {}) => {
  const { t } = useTranslation()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['call-customer-list-api'],
      })
      toast.success(t('form:tenant.success_update'))
    },
    ...config,
    mutationFn: updateCustomer,
  })
}
