import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

export const deleteFirmware = ({ id }: { id: string }) => {
  return axios.delete(`/api/ota/${id}`)
}

type UseDeleteFirmwareOptions = {
  config?: MutationConfig<typeof deleteFirmware>
}

export const useDeleteFirmWare = ({ config }: UseDeleteFirmwareOptions = {}) => {
  const { t } = useTranslation()

  const { addNotification } = useNotificationStore()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries(['firm-ware'])
      addNotification({
        type: 'success',
        title: t('cloud:firmware.add_firmware.success_delete'),
      })
    },
    ...config,
    mutationFn: deleteFirmware,
  })
}
