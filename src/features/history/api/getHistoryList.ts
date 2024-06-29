import { limitPagination } from '@/utils/const'
import { type SignHistory } from '../types'
import { axios } from '@/lib/axios'
import { type ExtractFnReturnType, type QueryConfig } from '@/lib/react-query'
import { RefetchOptions, useQuery } from '@tanstack/react-query'

type GetHistoryListRes = {
  data: SignHistory[]
  meta: {
    page: number
    limit: number
    total: number
  }
}

export type GetHistoryListProps = {
  certificateId?: number
  pageNum?: number
  pageSize?: number
}

export const getHistoryList = ({
  certificateId,
  pageNum = 1,
  pageSize = limitPagination,
}: GetHistoryListProps): Promise<GetHistoryListRes> => {
  return axios.get(`/api/signature/signed-file/${certificateId}`, {
    params: {
      pageNum: pageNum,
      pageSize: pageSize,
    },
  })
}

type QueryFnType = typeof getHistoryList

type UseGetHistoryListOptions = {
  config?: QueryConfig<QueryFnType>
} & GetHistoryListProps & RefetchOptions

export const useGetHistoryList = ({
  pageNum,
  pageSize,
  certificateId,
  config,
}: UseGetHistoryListOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['history', pageNum, pageSize, certificateId],
    queryFn: () => getHistoryList({ certificateId, pageNum, pageSize }),
    ...config,
  })
}
