import { axios } from '@/lib/axios'
import { type MutationConfig, queryClient } from '@/lib/react-query'
import { useMutation } from '@tanstack/react-query'

export type VerifyRes = {
  reason: string
  name: string
  subFilter: string
  filter: string
  contactInfo: string
  location: string
  signDate: Date
  hasTsaToken: boolean
  coversWholeDocument: boolean
  signatureVerified: string
  certificateInfo: {
    issuerDN: string
    subjectDN: string
    notValidBefore: Date
    notValidAfter: Date
    signAlgorithm: string
    serial: string
    issuerOIDs: {
      additionalProp1: string
      additionalProp2: string
      additionalProp3: string
    }
    subjectOIDs: {
      additionalProp1: string
      additionalProp2: string
      additionalProp3: string
    }
  }
  selfSigned: boolean
}

export type VerifyDTO = {
  files: File
}

export const verify = ({ files }: VerifyDTO): Promise<VerifyRes[]> => {
  const formData = new FormData()
  formData.append('files', files)
  return axios.post(`/api/signature/verify`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

type UseVerifyOptions = {
  config?: MutationConfig<typeof verify>
}

export const useVerify = ({ config }: UseVerifyOptions = {}) => {
  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['verify'],
      })
    },
    ...config,
    mutationFn: verify,
  })
}
