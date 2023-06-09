import { useMutation } from '@tanstack/react-query'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

import { type PoliciesReq } from './createRole'

export type UpdateRoleDTO = {
  data: {
    name: string
    policies: PoliciesReq[]
  }
  roleId: string
}

export const updateRole = ({ data, roleId }: UpdateRoleDTO) => {
  return axios.put(`/api/roles/${roleId}`, data)
}

type UseUpdateRoleOptions = {
  config?: MutationConfig<typeof updateRole>
}

export const useUpdateRole = ({ config }: UseUpdateRoleOptions = {}) => {
  const { addNotification } = useNotificationStore()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['roles'] })
      addNotification({
        type: 'success',
        title: 'Sửa vai trò thành công',
      })
    },
    ...config,
    mutationFn: updateRole,
  })
}
