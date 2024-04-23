import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { axios } from '@/lib/axios'
import { type MutationConfig, queryClient } from '@/lib/react-query'
import { toast } from 'sonner'

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

  return useMutation({
    onSuccess: async () => {
      toast.promise(
        () => queryClient.invalidateQueries(['call-customer-list-api']),
        {
          loading: t('loading:loading'),
          success: t('form:tenant.success_delete'),
          error: t('error:server_res.title'),
        },
      )
    },
    ...config,
    mutationFn: deleteCustomer,
  })
}
