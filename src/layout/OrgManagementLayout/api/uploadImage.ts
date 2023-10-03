import type * as z from 'zod'
import { useMutation } from '@tanstack/react-query'

import { axiosUploadFile } from '~/lib/axios'
import { type MutationConfig, queryClient } from '~/lib/react-query'

import {
  type uploadImageSchema,
  type uploadImageResSchema,
} from '../components/CreateOrg'

type UploadImageRes = z.infer<typeof uploadImageResSchema>

type UploadImage = {
  project_id: string
  file: z.infer<typeof uploadImageSchema>
}

export type UploadImageDTO = {
  data: UploadImage
}

export const uploadImage = ({
  data,
}: UploadImageDTO): Promise<UploadImageRes> => {
  return axiosUploadFile.post(`/api/miniovt/file/upload`, data)
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
