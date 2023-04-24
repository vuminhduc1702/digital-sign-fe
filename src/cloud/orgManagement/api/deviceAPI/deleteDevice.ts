import { useMutation } from '@tanstack/react-query'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

export const deleteDevice = ({ id }: { id: string }) => {
  return axios.delete(`/api/devices/${id}`)
}

type UseDeleteDeviceOptions = {
  config?: MutationConfig<typeof deleteDevice>
}

export const useDeleteDevice = ({ config }: UseDeleteDeviceOptions = {}) => {
  const { addNotification } = useNotificationStore()
  return useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries(['devices'])
      addNotification({
        type: 'success',
        title: 'Xóa thiết bị thành công',
      })
    },
    ...config,
    mutationFn: deleteDevice,
  })
}
