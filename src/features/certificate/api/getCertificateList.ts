import { axios } from '@/lib/axios'
import { type Certificate } from '../types'
import { limitPagination } from '@/utils/const'
import { type ExtractFnReturnType, type QueryConfig } from '@/lib/react-query'
import { useQuery } from '@tanstack/react-query'

type GetCertificateListRes = {
  data: Certificate[]
  meta: {
    page: number
    limit: number
    total: number
  }
}

export type GetCertificateListProps = {
  pageNum?: number
  pageSize?: number
}

export const getCertificateList = ({
  pageNum = 1,
  pageSize = limitPagination,
}: GetCertificateListProps): Promise<GetCertificateListRes> => {
  return axios.get(`/api/certificate`, {
    params: {
      pageNum: pageNum,
      pageSize: pageSize,
    },
  })
}

type QueryFnType = typeof getCertificateList

type UseGetCertificateListOptions = {
  config?: QueryConfig<QueryFnType>
} & GetCertificateListProps

export const useGetCertificateList = ({
  pageNum,
  pageSize,
  config,
}: UseGetCertificateListOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['certificate', pageNum, pageSize],
    queryFn: () => getCertificateList({ pageNum, pageSize }),
    ...config,
  })
}
