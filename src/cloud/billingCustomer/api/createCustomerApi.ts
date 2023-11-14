import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import type * as z from 'zod'
import { axios } from '~/lib/axios'
import { queryClient, type MutationConfig } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'
import { type entityCustomerSchema } from '../components/CreateCustomer'

export type CreateEntityCustomerDTO = {
  data: z.infer<typeof entityCustomerSchema>
}

export const createCustomer = ({ data }: CreateEntityCustomerDTO) => {
  return axios.post(`/api/tenant`, data)
}

type UseCreateCustomerOptions = {
  config?: MutationConfig<typeof createCustomer>
}

export const useCreateCustomer = ({
  config,
}: UseCreateCustomerOptions = {}) => {
  const { t } = useTranslation()

  const { addNotification } = useNotificationStore()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['call-customer-list-api'],
      })
      addNotification({
        type: 'success',
        title: t('cloud:org_manage.user_manage.add_user.success_create'),
      })
    },
    ...config,
    mutationFn: createCustomer,
  })
}
