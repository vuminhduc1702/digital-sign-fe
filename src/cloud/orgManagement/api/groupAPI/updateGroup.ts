import { useMutation } from '@tanstack/react-query'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

export type UpdateGroupDTO = {
  data: {
    name: string
  }
  groupId: string
}

export const updateGroup = ({ data, groupId }: UpdateGroupDTO) => {
  return axios.put(`/api/groups/${groupId}`, data)
}

type UseUpdateGroupOptions = {
  config?: MutationConfig<typeof updateGroup>
}

export const useUpdateGroup = ({ config }: UseUpdateGroupOptions = {}) => {
  const { addNotification } = useNotificationStore()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['groups'],
      })
      addNotification({
        type: 'success',
        title: 'Sửa nhóm thành công',
      })
    },
    ...config,
    mutationFn: updateGroup,
  })
}
