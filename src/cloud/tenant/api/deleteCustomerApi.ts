import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

export const deleteCustomer = ({ id }: { id: string }) => {
  return axios.delete(`/api/tenant/${id}`)
}

type UseDeleteCustomerOptions = {
  config?: MutationConfig<typeof deleteCustomer>
}

export const useDeleteCustomer = ({
  config,
}: UseDeleteCustomerOptions = {}) => {
  const { t } = useTranslation()

  const { addNotification } = useNotificationStore()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries(['call-customer-list-api'])
      addNotification({
        type: 'success',
        title: t('form:customer.success_delete'),
      })
    },
    ...config,
    mutationFn: deleteCustomer,
  })
}
