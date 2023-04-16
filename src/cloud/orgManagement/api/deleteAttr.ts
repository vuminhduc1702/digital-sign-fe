import { useMutation } from '@tanstack/react-query'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

type DeleteAttr = {
  entityId: string
  entityType: string
  attrType: 'SCOPE_CLIENT' | 'SCOPE_SERVER'
  attrKey: string
}

export const deleteAttr = ({
  entityId,
  entityType,
  attrType,
  attrKey,
}: DeleteAttr) => {
  return axios.delete(
    `/api/attributes/${entityType}/${entityId}/${attrType}/${attrKey}/values`,
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
        title: 'Attribute Deleted',
      })
    },
    ...config,
    mutationFn: deleteAttr,
  })
}
