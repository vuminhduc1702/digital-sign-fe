import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { axios } from '@/lib/axios'
import { type MutationConfig, queryClient } from '@/lib/react-query'
import { toast } from 'sonner'

export type deleteEntityMultipleUsersDTO = {
  data: {
    ids: string[]
  }
}

export const deleteMultipleUsers = (data: deleteEntityMultipleUsersDTO) => {
  return axios.delete(`/api/users/remove/list`, data)
}

type UseDeleteMultipleUserOptions = {
  config?: MutationConfig<typeof deleteMultipleUsers>
}

export const useDeleteMultipleUsers = ({
  config,
}: UseDeleteMultipleUserOptions = {}) => {
  const { t } = useTranslation()

  return useMutation({
    onSuccess: async () => {
      toast.promise(() => queryClient.invalidateQueries(['users']), {
        loading: t('loading:loading'),
        success: t('cloud:org_manage.user_manage.add_user.success_delete'),
        error: t('error:server_res.title'),
      })
    },
    ...config,
    mutationFn: deleteMultipleUsers,
  })
}
