import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'
import { type entityFirmWareSchema } from '../../components/Firmware'
import type * as z from 'zod'

export type UpdateFirmwareDTO = {
  data: z.infer<typeof entityFirmWareSchema>
  firmwareId: string
}

export const updateFirmware = ({ data, firmwareId }: UpdateFirmwareDTO) => {
  return axios.put(`/api/ota/${firmwareId}`, data)
}

type UseUpdateFirmwareOptions = {
  config?: MutationConfig<typeof updateFirmware>
}

export const useUpdateFirmware = ({ config }: UseUpdateFirmwareOptions = {}) => {
  const { t } = useTranslation()

  const { addNotification } = useNotificationStore()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['firm-ware'],
      })
      addNotification({
        type: 'success',
        title: t('cloud:firmware.add_firmware.success_update'),
      })
    },
    ...config,
    mutationFn: updateFirmware,
  })
}
