import { axios } from '@/lib/axios'
import { type MutationConfig, queryClient } from '@/lib/react-query'
import { useMutation } from '@tanstack/react-query'

export type VerifyGroupRes = {
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
  certificateStatus: string
  selfSigned: boolean
}

export type VerifyGroupDTO = {
  signedFile: File
  originalFile: File
}

export const verifyGroup = ({ signedFile, originalFile }: VerifyGroupDTO): Promise<VerifyGroupRes[]> => {
  const formData = new FormData()
  formData.append('signedFile', signedFile)
  formData.append('originalFile', originalFile)
  return axios.post(`/api/group/sign-request/verify`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

type UseVerifyGroupOptions = {
  config?: MutationConfig<typeof verifyGroup>
}

export const useVerifyGroup = ({ config }: UseVerifyGroupOptions = {}) => {
  return useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['verify'],
      })
    },
    ...config,
    mutationFn: verifyGroup,
  })
}
