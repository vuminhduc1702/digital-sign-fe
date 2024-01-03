import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { toast } from 'sonner'
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

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['firm-ware'],
      })
      toast.success(t('cloud:firmware.add_firmware.success_update'))
    },
    ...config,
    mutationFn: updateFirmware,
  })
}
