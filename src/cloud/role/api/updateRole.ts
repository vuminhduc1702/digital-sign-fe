import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { toast } from 'sonner'

import { type PoliciesReq } from './createRole'

export type UpdateRoleDTO = {
  data: {
    name: string
    role_type: string
    policies: PoliciesReq[]
  }
  roleId: string
}

export const updateRole = ({ data, roleId }: UpdateRoleDTO) => {
  return axios.put(`/api/roles${data.role_type === 'Group' ? '/group' : ''}/${roleId}`, data)
}

type UseUpdateRoleOptions = {
  config?: MutationConfig<typeof updateRole>
}

export const useUpdateRole = ({ config }: UseUpdateRoleOptions = {}) => {
  const { t } = useTranslation()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['roles'] })
      toast.success(t('cloud:role_manage.add_role.success_update'))
    },
    ...config,
    mutationFn: updateRole,
  })
}
