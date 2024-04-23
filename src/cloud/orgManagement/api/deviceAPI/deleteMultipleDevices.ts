import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { axios } from '@/lib/axios'
import { type MutationConfig, queryClient } from '@/lib/react-query'
import { toast } from 'sonner'

export type deleteEntityMultipleDevicesDTO = {
  data: {
    ids: string[]
  }
}

export const deleteMultipleDevices = (data: deleteEntityMultipleDevicesDTO) => {
  return axios.delete(`/api/devices/remove/list`, data)
}

type UseDeleteMultipleDeviceOptions = {
  config?: MutationConfig<typeof deleteMultipleDevices>
}

export const useDeleteMultipleDevices = ({
  config,
}: UseDeleteMultipleDeviceOptions = {}) => {
  const { t } = useTranslation()

  return useMutation({
    onSuccess: async () => {
      toast.promise(() => queryClient.invalidateQueries(['devices']), {
        loading: t('loading:loading'),
        success: t('cloud:org_manage.device_manage.add_device.success_delete'),
        error: t('error:server_res.title'),
      })
    },
    ...config,
    mutationFn: deleteMultipleDevices,
  })
}
