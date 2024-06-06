import { axios } from '@/lib/axios'
import { type ExtractFnReturnType, type QueryConfig } from '@/lib/react-query'
import { useQuery } from '@tanstack/react-query'

export type ActiveCertificate = {
  notValidAfter: Date
  notValidBefore: Date
  certificateId: number
  commonName: string
  serialNumber: string
  subjectName: string
  statusName: string
}

export const getActiveCertificateList = (): Promise<ActiveCertificate[]> => {
  return axios.get(`/api/certificate/active`)
}

type QueryFnType = typeof getActiveCertificateList

type UseGetActiveCertificateListOptions = {
  config?: QueryConfig<QueryFnType>
}

export const useGetActiveCertificateList = ({
  config,
}: UseGetActiveCertificateListOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['activeCertificate'],
    queryFn: () => getActiveCertificateList(),
    ...config,
  })
}
