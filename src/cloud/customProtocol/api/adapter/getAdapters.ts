import { useQuery } from '@tanstack/react-query'
import { axios } from '@/lib/axios'

import { limitPagination } from '@/utils/const'

import { type ExtractFnReturnType, type QueryConfig } from '@/lib/react-query'
import { type AdapterList } from '../../types'

type GetAdapters = {
  projectId: string
  offset?: number
  limit?: number
  search_str?: string
  search_field?: string
}

export const getAdapters = ({
  projectId,
  offset,
  limit,
  search_str,
  search_field,
}: GetAdapters): Promise<AdapterList> => {
  const searchFieldArray = search_field?.split(',')
  const params = new URLSearchParams({
    project_id: projectId,
    offset: String(offset),
    limit: String(limit),
    search_str: search_str || '',
  })
  searchFieldArray?.forEach(field => {
    params.append('search_field', field)
  })
  return axios.get(`/api/adapter`, {
    params,
    // : {
    //   project_id: projectId,
    //   offset,
    //   limit,
    //   search_str,
    //   search_field,
    // },
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
  search_str,
  search_field,
  config,
}: UseAdapterOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['adapters', projectId, offset, limit, search_str, search_field],
    queryFn: () =>
      getAdapters({ projectId, offset, limit, search_str, search_field }),
    ...config,
  })
}
