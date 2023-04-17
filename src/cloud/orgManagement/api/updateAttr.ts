import { useMutation } from '@tanstack/react-query'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

type Attributes = {
  attribute_key: string
  logged: boolean
  value?: string | number | boolean
  value_t: string
}

export type UpdateAttrDTO = {
  data: {
    attributes: Attributes[]
  }
  entityType: string
  orgId: string
}

export const updateAttr = ({ data, entityType, orgId }: UpdateAttrDTO) => {
  return axios.post(`/api/attributes/${entityType}/${orgId}/values`, data)
}

export type UseUpdateAttrOptions = {
  config?: MutationConfig<typeof updateAttr>
}

export const useUpdateAttr = ({ config }: UseUpdateAttrOptions = {}) => {
  const { addNotification } = useNotificationStore()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['orgById'] })
      addNotification({
        type: 'success',
        title: 'Sửa thuộc tính thành công',
      })
    },
    ...config,
    mutationFn: updateAttr,
  })
}
