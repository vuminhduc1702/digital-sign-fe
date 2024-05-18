import type * as z from 'zod'
import { useMutation } from '@tanstack/react-query'

import { axios } from '@/lib/axios'
import { type MutationConfig, queryClient } from '@/lib/react-query'

import { type uploadImageResSchema } from '../components/CreateOrg'
import { type UploadImageDTO } from '@/utils/hooks'

type UploadImageRes = z.infer<typeof uploadImageResSchema>

export const uploadImage = ({
  data,
}: UploadImageDTO): Promise<UploadImageRes> => {
  return axios.post(`/api/miniovt/file/upload`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

type UseUploadImageOptions = {
  config?: MutationConfig<typeof uploadImage>
}

export const useUploadImage = ({ config }: UseUploadImageOptions = {}) => {
  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['upload-image'],
      })
    },
    ...config,
    mutationFn: uploadImage,
  })
}
