import { useMutation } from '@tanstack/react-query'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

type CreateUserRes = {
  identity_id: string
}

export type CreateUserDTO = {
  data: {
    project_id: string
    name: string
    org_id: string
  }
}

export const createUser = ({ data }: CreateUserDTO): Promise<CreateUserRes> => {
  return axios.post(`/api/users`, data)
}

type UseCreateUserOptions = {
  config?: MutationConfig<typeof createUser>
}

export const useCreateUser = ({ config }: UseCreateUserOptions = {}) => {
  const { addNotification } = useNotificationStore()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['users'],
      })
      addNotification({
        type: 'success',
        title: 'Tạo user thành công',
      })
    },
    ...config,
    mutationFn: createUser,
  })
}
