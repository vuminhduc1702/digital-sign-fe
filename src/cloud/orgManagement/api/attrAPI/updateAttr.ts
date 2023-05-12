import { useMutation } from '@tanstack/react-query'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

import { type AttributesDTO } from './createAttr'

export type UpdateAttrDTO = {
  data: {
    attributes: AttributesDTO[]
  }
  entityType: string
  entityId: string
}

export const updateAttr = ({ data, entityType, entityId }: UpdateAttrDTO) => {
  return axios.put(`/api/attributes/${entityType}/${entityId}/values`, data)
}

export type UseUpdateAttrOptions = {
  config?: MutationConfig<typeof updateAttr>
}

export const useUpdateAttr = ({ config }: UseUpdateAttrOptions = {}) => {
  const { addNotification } = useNotificationStore()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries(['attr'])
      await queryClient.invalidateQueries(['deviceById'])
      addNotification({
        type: 'success',
        title: 'Sửa thuộc tính thành công',
      })
    },
    ...config,
    mutationFn: updateAttr,
  })
}
