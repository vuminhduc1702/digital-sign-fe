import { useMutation } from '@tanstack/react-query'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

export const deleteRole = ({ id }: { id: string }) => {
  return axios.delete(`/api/roles/${id}`)
}

type UseDeleteRoleOptions = {
  config?: MutationConfig<typeof deleteRole>
}

export const useDeleteRole = ({ config }: UseDeleteRoleOptions = {}) => {
  const { addNotification } = useNotificationStore()
  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries(['roles'])
      addNotification({
        type: 'success',
        title: 'Xóa vai trò thành công',
      })
    },
    ...config,
    mutationFn: deleteRole,
  })
}
