import { useMutation } from '@tanstack/react-query'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

import { type EntityType } from './createAttr'

type DeleteAttr = {
  entityId: string
  entityType: EntityType
  attrKey: string
}

export const deleteAttr = ({ entityId, entityType, attrKey }: DeleteAttr) => {
  return axios.delete(
    `/api/attributes/${entityType}/${entityId}/SCOPE_CLIENT/${attrKey}/values`,
  )
}

type UseDeleteAttrOptions = {
  config?: MutationConfig<typeof deleteAttr>
}

export const useDeleteAttr = ({ config }: UseDeleteAttrOptions = {}) => {
  const { addNotification } = useNotificationStore()
  return useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries(['orgById'])
      addNotification({
        type: 'success',
        title: 'Xoá thuộc tính thành công',
      })
    },
    ...config,
    mutationFn: deleteAttr,
  })
}
