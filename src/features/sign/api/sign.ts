import { axios } from '@/lib/axios'
import { type MutationConfig, queryClient } from '@/lib/react-query'
import { type BaseAPIRes } from '@/types'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

type SignRes = {
  message: string
  fileId: number
  fileName: string
  fileSize: string
} & BaseAPIRes

export type SignDTO = {
  body: {
    signatureLocation?: string
    signatureReason?: string
    visibleLine1?: string
    certificateId?: number
    password: string
  }
  file: File
}

export const sign = ({ body, file }: SignDTO): Promise<SignRes> => {
  const formData = new FormData()
  const json = JSON.stringify(body)
  const blob = new Blob([json], {
    type: 'application/json',
  })
  formData.append('body', blob)
  formData.append('files', file)
  return axios.post(`/api/signature/sign`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

type UseSignOptions = {
  config?: MutationConfig<typeof sign>
}

export const useSign = ({ config }: UseSignOptions = {}) => {
  const {t} = useTranslation()
  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['sign'],
      })
      toast.success(t('sign:success_toast'))
    },
    ...config,
    mutationFn: sign,
  })
}
