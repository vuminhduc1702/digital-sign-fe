import { useQuery } from '@tanstack/react-query'
import { axios } from '@/lib/axios'

import { limitPagination } from '@/utils/const'

import { type ExtractFnReturnType, type QueryConfig } from '@/lib/react-query'
import { type AdapterList } from '../../types'

type GetAdapters = {
  projectId: string
  offset?: number
  limit?: number
}

export const getAdapters = ({
  projectId,
  offset,
  limit,
}: GetAdapters): Promise<AdapterList> => {
  return axios.get(`/api/adapter`, {
    params: {
      project_id: projectId,
      offset,
      limit,
    },
  })
}

type QueryFnType = typeof getAdapters

type UseAdapterOptions = {
  config?: QueryConfig<QueryFnType>
} & GetAdapters

export const useGetAdapters = ({
  projectId,
  offset = 0,
  limit = limitPagination,
  config,
}: UseAdapterOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['adapters', projectId, offset, limit],
    queryFn: () => getAdapters({ projectId, offset, limit }),
    ...config,
  })
}
