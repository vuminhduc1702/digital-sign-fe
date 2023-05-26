import { useMutation } from '@tanstack/react-query'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

import { type Policies, type Role } from '../types'

export type CreateRoleDTO = {
  data: {
    name: string
    project_id: string
    policies: Policies[]
  }
}

export const createRole = ({ data }: CreateRoleDTO): Promise<Role> => {
  return axios.post(`/api/roles`, data)
}

type UseCreateRoleOptions = {
  config?: MutationConfig<typeof createRole>
}

export const useCreateRole = ({ config }: UseCreateRoleOptions = {}) => {
  const { addNotification } = useNotificationStore()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['roles'],
      })
      addNotification({
        type: 'success',
        title: 'Tạo vai trò thành công',
      })
    },
    ...config,
    mutationFn: createRole,
  })
}
