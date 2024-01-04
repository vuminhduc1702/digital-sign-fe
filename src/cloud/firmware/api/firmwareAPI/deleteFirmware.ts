import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { toast } from 'sonner'

export const deleteFirmware = ({ id }: { id: string }) => {
  return axios.delete(`/api/ota/${id}`)
}

type UseDeleteFirmwareOptions = {
  config?: MutationConfig<typeof deleteFirmware>
}

export const useDeleteFirmWare = ({ config }: UseDeleteFirmwareOptions = {}) => {
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
    mutationFn: deleteFirmware,
  })
}
