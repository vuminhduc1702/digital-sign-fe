import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { axios } from '~/lib/axios'
import { queryClient, type MutationConfig } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

export type UpdateVersionFirmwareDTO = {
  data: {
    version: string
    project_id: string
    name: string
    device_ids: string[]
  }
}

export const updateVersionFirmware = ({ data }: UpdateVersionFirmwareDTO) => {
  return axios.put(`/api/ota/version`, data)
}

type UseUpdateVersionFirmwareOptions = {
  config?: MutationConfig<typeof updateVersionFirmware>
}

export const useUpdateVersionFirmware = ({
  config,
}: UseUpdateVersionFirmwareOptions = {}) => {
  const { t } = useTranslation()

  const { addNotification } = useNotificationStore()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['update-version-firmware'],
      })
      addNotification({
        type: 'success',
        title: t('cloud:firmware.add_firmware.success_update_version'),
      })
    },
    ...config,
    mutationFn: updateVersionFirmware,
  })
}
