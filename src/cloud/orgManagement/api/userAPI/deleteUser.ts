import { useMutation } from '@tanstack/react-query'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

export const deleteUser = ({ user_id }: { user_id: string }) => {
  return axios.delete(`/api/users/${user_id}`)
}

type UseDeleteUserOptions = {
  config?: MutationConfig<typeof deleteUser>
}

export const useDeleteUser = ({ config }: UseDeleteUserOptions = {}) => {
  const { addNotification } = useNotificationStore()
  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries(['users'])
      addNotification({
        type: 'success',
        title: 'Xóa user thành công',
      })
    },
    ...config,
    mutationFn: deleteUser,
  })
}
