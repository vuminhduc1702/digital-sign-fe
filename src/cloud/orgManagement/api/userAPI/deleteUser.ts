import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { axios } from '@/lib/axios'
import { type MutationConfig, queryClient } from '@/lib/react-query'
import { toast } from 'sonner'

export const deleteUser = ({ user_id }: { user_id: string }) => {
  return axios.delete(`/api/users/${user_id}`)
}

type UseDeleteUserOptions = {
  config?: MutationConfig<typeof deleteUser>
}

export const useDeleteUser = ({ config }: UseDeleteUserOptions = {}) => {
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
    mutationFn: deleteUser,
  })
}
