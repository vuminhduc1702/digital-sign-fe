import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

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

  const { addNotification } = useNotificationStore()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['call-customer-list-api'],
      })
      addNotification({
        type: 'success',
        title: t('form:customer.success_update'),
      })
    },
    ...config,
    mutationFn: updateCustomer,
  })
}
