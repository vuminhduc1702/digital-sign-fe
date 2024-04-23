import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { axios } from '@/lib/axios'
import { type MutationConfig, queryClient } from '@/lib/react-query'
import { toast } from 'sonner'

export const deleteRole = ({ id }: { id: string }) => {
  return axios.delete(`/api/roles/${id}`)
}

type UseDeleteRoleOptions = {
  config?: MutationConfig<typeof deleteRole>
}

export const useDeleteRole = ({ config }: UseDeleteRoleOptions = {}) => {
  const { t } = useTranslation()

  return useMutation({
    onSuccess: async () => {
      toast.promise(() => queryClient.invalidateQueries(['roles']), {
        loading: t('loading:loading'),
        success: t('cloud:role_manage.add_role.success_delete'),
        error: t('error:server_res.title'),
      })
    },
    ...config,
    mutationFn: deleteRole,
  })
}
