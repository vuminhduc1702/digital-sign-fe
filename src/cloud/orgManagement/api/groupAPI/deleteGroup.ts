import { useMutation } from '@tanstack/react-query'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

export const deleteGroup = ({ id }: { id: string }) => {
  return axios.delete(`/api/groups/${id}`)
}

type UseDeleteGroupOptions = {
  config?: MutationConfig<typeof deleteGroup>
}

export const useDeleteGroup = ({ config }: UseDeleteGroupOptions = {}) => {
  const { addNotification } = useNotificationStore()
  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries(['groups'])
      addNotification({
        type: 'success',
        title: 'Xóa nhóm thành công',
      })
    },
    ...config,
    mutationFn: deleteGroup,
  })
}
