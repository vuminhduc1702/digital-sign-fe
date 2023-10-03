import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { axiosUploadFile } from '~/lib/axios'
import { queryClient, type MutationConfig } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

export type UploadFileFirmWareDTO = {
  formData: any
  firmwareId: string
}

export const uploadFileFirmWare = ({ formData, firmwareId }: UploadFileFirmWareDTO) => {
  return axiosUploadFile.post(`/api/ota/${firmwareId}`, formData)
}

type UseUploadFileFirmWareOptions = {
  config?: MutationConfig<typeof uploadFileFirmWare>
}

export const useUploadFileFireWare = ({
  config,
}: UseUploadFileFirmWareOptions = {}) => {
  const { t } = useTranslation()

  const { addNotification } = useNotificationStore()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['firm-ware'],
      })
      addNotification({
        type: 'success',
        title: t('cloud:firmware.add_firmware.success_upload'),
      })
    },
    ...config,
    mutationFn: uploadFileFirmWare,
  })
}
