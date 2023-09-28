import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

export type UpdateDeviceDTO = {
  data: {
    name: string
    key: string
    org_id: string
    group_id: string
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
  const { t } = useTranslation()

  const { addNotification } = useNotificationStore()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['devices'],
      })
      addNotification({
        type: 'success',
        title: t('cloud:org_manage.device_manage.add_device.success_update'),
      })
    },
    ...config,
    mutationFn: updateDevice,
  })
}
