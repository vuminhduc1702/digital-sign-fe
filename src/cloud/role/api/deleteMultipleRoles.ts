import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { toast } from 'sonner'

export type deleteEntityMultipleRolesDTO = {
  data: {
    ids: string[]
  }
}

export const deleteMultipleRoles = (data: deleteEntityMultipleRolesDTO) => {
  return axios.delete(`/api/roles/remove/list`, data)
}

type UseDeleteMultipleRoleOptions = {
  config?: MutationConfig<typeof deleteMultipleRoles>
}

export const useDeleteMultipleRoles = ({
  config,
}: UseDeleteMultipleRoleOptions = {}) => {
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
    mutationFn: deleteMultipleRoles,
  })
}
