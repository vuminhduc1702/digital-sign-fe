import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { toast } from 'sonner'

export type deleteEntityMultipleFirmwareDTO = {
  data: {
    ids: string[]
  }
}

export const deleteMultipleFirmware = (
  data: deleteEntityMultipleFirmwareDTO,
) => {
  return axios.delete(`/api/ota/remove/list`, data)
}

type UseDeleteMultipleFirmwareOptions = {
  config?: MutationConfig<typeof deleteMultipleFirmware>
}

export const useDeleteMultipleFirmware = ({
  config,
}: UseDeleteMultipleFirmwareOptions = {}) => {
  const { t } = useTranslation()

  return useMutation({
    onSuccess: async () => {
      toast.promise(() => queryClient.invalidateQueries(['firm-ware']), {
        loading: t('loading:loading'),
        success: t('cloud:firmware.add_firmware.success_delete'),
        error: t('error:server_res.title'),
      })
    },
    ...config,
    mutationFn: deleteMultipleFirmware,
  })
}
