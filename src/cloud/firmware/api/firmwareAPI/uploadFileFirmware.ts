import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { axiosUploadFile } from '~/lib/axios'
import { queryClient, type MutationConfig } from '~/lib/react-query'
import { toast } from 'sonner'

export type UploadFileFirmWareDTO = {
  file: any
  firmwareId: string
}

export const uploadFileFirmWare = ({ file, firmwareId }: UploadFileFirmWareDTO) => {
  return axiosUploadFile.post(`/api/ota/${firmwareId}`, file)
}

type UseUploadFileFirmWareOptions = {
  config?: MutationConfig<typeof uploadFileFirmWare>
}

export const useUploadFileFireWare = ({
  config,
}: UseUploadFileFirmWareOptions = {}) => {
  const { t } = useTranslation()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['firm-ware'],
      })
      toast.success(t('cloud:firmware.add_firmware.success_upload'))
    },
    ...config,
    mutationFn: uploadFileFirmWare,
  })
}
