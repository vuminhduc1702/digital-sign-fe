import { useMutation } from '@tanstack/react-query'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

export type UpdateDeviceDTO = {
  data: {
    name: string
  }
  deviceId: string
}

export const updateDevice = ({ data, deviceId }: UpdateDeviceDTO) => {
  return axios.put(`/api/devices/${deviceId}`, data)
}

type UseUpdateDeviceOptions = {
  config?: MutationConfig<typeof updateDevice>
}

export const useUpdateDevice = ({ config }: UseUpdateDeviceOptions = {}) => {
  const { addNotification } = useNotificationStore()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['devices'],
      })
      addNotification({
        type: 'success',
        title: 'Sửa thiết bị thành công',
      })
    },
    ...config,
    mutationFn: updateDevice,
  })
}
