import { useMutation } from '@tanstack/react-query'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

import { type Attribute } from '~/types'
import { type Group } from '../../types'

type CreateGroupRes = Omit<Group, keyof Attribute[]>

export type CreateGroupDTO = {
  data: {
    name: string
    project_id: string
    entity_type: 'ORGANIZATION' | 'DEVICE' | 'USER' | 'EVENT'
    org_id: string
  }
}

export const createGroup = ({
  data,
}: CreateGroupDTO): Promise<CreateGroupRes> => {
  return axios.post(`/api/groups`, data)
}

type UseCreateGroupOptions = {
  config?: MutationConfig<typeof createGroup>
}

export const useCreateGroup = ({ config }: UseCreateGroupOptions = {}) => {
  const { addNotification } = useNotificationStore()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['groups'],
      })
      addNotification({
        type: 'success',
        title: 'Tạo nhóm thành công',
      })
    },
    ...config,
    mutationFn: createGroup,
  })
}
