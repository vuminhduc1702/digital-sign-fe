import { useMutation } from '@tanstack/react-query'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

export const deleteOrg = ({ orgId }: { orgId: string }) => {
  return axios.delete(`/api/organizations/${orgId}`)
}

type UseDeleteOrgOptions = {
  config?: MutationConfig<typeof deleteOrg>
}

export const useDeleteOrg = ({ config }: UseDeleteOrgOptions = {}) => {
  const { addNotification } = useNotificationStore()
  return useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries(['orgs'])
      addNotification({
        type: 'success',
        title: 'Xóa tổ chức thành công',
      })
    },
    ...config,
    mutationFn: deleteOrg,
  })
}