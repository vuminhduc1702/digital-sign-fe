import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { toast } from 'sonner'

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

  return useMutation({
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ['devices'],
      })
      toast.success(
        t('device:udpate_device').replace(
          '{{value}}',
          variables.type.toUpperCase(),
        ),
      )
    },
    ...config,
    mutationFn: blockAndActiveDevice,
  })
}
