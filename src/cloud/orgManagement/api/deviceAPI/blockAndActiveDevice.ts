import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

export type BlockAndActiveDeviceDTO = {
  type: string
  deviceId: string
}

export const blockAndActiveDevice = ({
  type,
  deviceId,
}: BlockAndActiveDeviceDTO) => {
  if (type === 'block') {
    return axios.put(`/api/devices/${deviceId}/block`)
  }
  return axios.put(`/api/devices/${deviceId}/active`)
}

type UseBlockAndUpdateDeviceOptions = {
  config?: MutationConfig<typeof blockAndActiveDevice>
}

export const useBlockAndActiveDevice = ({
  config,
}: UseBlockAndUpdateDeviceOptions = {}) => {
  const { t } = useTranslation()

  const { addNotification } = useNotificationStore()

  return useMutation({
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ['devices'],
      })
      addNotification({
        type: 'success',
        title: t('device:udpate_device').replace(
          '{{value}}',
          variables.type.toUpperCase(),
        ),
      })
    },
    ...config,
    mutationFn: blockAndActiveDevice,
  })
}
