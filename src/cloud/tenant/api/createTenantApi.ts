import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import type * as z from 'zod'
import { axios } from '@/lib/axios'
import { queryClient, type MutationConfig } from '@/lib/react-query'
import { toast } from 'sonner'
import { type entityCustomerSchema } from '../components/CreateTenant'

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

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['call-customer-list-api'],
      })
      toast.success(t('cloud:org_manage.user_manage.add_user.success_create'))
    },
    ...config,
    mutationFn: createCustomer,
  })
}
