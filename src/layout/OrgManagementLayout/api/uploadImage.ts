import type * as z from 'zod'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'

import { axios } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'
import { useNotificationStore } from '~/stores/notifications'

import {
  type uploadImageSchema,
  type uploadImageResSchema,
} from '../components/CreateOrg'

type UploadImageRes = z.infer<typeof uploadImageResSchema>

export type UploadImageDTO = { data: z.infer<typeof uploadImageSchema> }

export const uploadImage = ({
  data,
}: UploadImageDTO): Promise<UploadImageRes> => {
  return axios.post(`/api/miniovt/file/upload`, data)
}

type UseUploadImageOptions = {
  config?: MutationConfig<typeof uploadImage>
}

export const useUploadImage = ({ config }: UseUploadImageOptions = {}) => {
  const { t } = useTranslation()

  const { addNotification } = useNotificationStore()

  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['upload-image'],
      })
      addNotification({
        type: 'success',
        title: t('cloud:org_manage.org_manage.add_org.success_uploadImage'),
      })
    },
    ...config,
    mutationFn: uploadImage,
  })
}
