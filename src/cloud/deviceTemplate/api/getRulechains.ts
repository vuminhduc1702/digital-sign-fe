import { useQuery } from '@tanstack/react-query'
import { axios } from '@/lib/axios'
import { limitPagination } from '@/utils/const'
import { type ExtractFnReturnType, type QueryConfig } from '@/lib/react-query'
import { type RulechainList } from '../types'

type GetRulechains = {
  projectId: string
  page?: number
  pageSize?: number
}

export const getRuleChains = ({
  projectId,
  page,
  pageSize,
}: GetRulechains): Promise<RulechainList> => {
  return axios.get('/api/ruleChains', {
    params: {
      projectId: projectId,
      page,
      pageSize,
    },
  })
}
type QueryFnType = typeof getRuleChains

type UseRulechainsOptions = {
  config?: QueryConfig<QueryFnType>
} & GetRulechains

export const useGetRulechains = ({
  projectId,
  page = 0,
  pageSize = limitPagination,
  config,
}: UseRulechainsOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['rulechains', projectId, page, pageSize],
    queryFn: () => getRuleChains({ projectId, page, pageSize }),
    ...config,
  })
}
