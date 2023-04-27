import { useMutation } from '@tanstack/react-query'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

export type UpdateAttrDTO = {
  data: {
    value: string | number | boolean
    value_t: string
    // logged: string
  }
  attributeKey: string
  entityType: string
  entityId: string
}

export const updateAttr = ({
  data,
  attributeKey,
  entityType,
  entityId,
}: UpdateAttrDTO) => {
  return axios.put(
    `/api/attributes/${entityType}/${entityId}/SCOPE_CLIENT/${attributeKey}/values`,
    data,
  )
}

export type UseUpdateAttrOptions = {
  config?: MutationConfig<typeof updateAttr>
}

export const useUpdateAttr = ({ config }: UseUpdateAttrOptions = {}) => {
  const { addNotification } = useNotificationStore()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries(['orgById'])
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
