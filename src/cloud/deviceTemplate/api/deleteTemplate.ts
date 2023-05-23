import { useMutation } from '@tanstack/react-query'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

export const deleteTemplate = ({ id }: { id: string }) => {
  return axios.delete(`/api/templates/${id}`)
}

type UseDeleteTemplateOptions = {
  config?: MutationConfig<typeof deleteTemplate>
}

export const useDeleteTemplate = ({
  config,
}: UseDeleteTemplateOptions = {}) => {
  const { addNotification } = useNotificationStore()
  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries(['templates'])
      addNotification({
        type: 'success',
        title: 'Xóa mẫu thiết bị thành công',
      })
    },
    ...config,
    mutationFn: deleteTemplate,
  })
}
