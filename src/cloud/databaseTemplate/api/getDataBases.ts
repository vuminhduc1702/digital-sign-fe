import { useQuery } from '@tanstack/react-query'
import { axios } from '@/lib/axios'

import { limitPagination } from '@/utils/const'

import { type ExtractFnReturnType, type QueryConfig } from '@/lib/react-query'
import { type DataBaseList } from '../types'

type GetDataBases = {
  projectId: string
  offset?: number
  limit?: number
  search_field?: string
  search_str?: string
}

export const getDataBases = ({
  projectId,
  search_field,
  search_str,
}: GetDataBases): Promise<DataBaseList> => {
  return axios.get(`/api/fe/table`, {
    params: {
      project_id: projectId,
      get_index: true,
      search_field: search_field,
      search_str: search_str,
    },
  })
}

type QueryFnType = typeof getDataBases

type UseTemplateOptions = {
  config?: QueryConfig<QueryFnType>
} & GetDataBases

export const useGetDataBases = ({
  projectId,
  search_field,
  search_str,
  config,
}: UseTemplateOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['dataBases', projectId, search_field, search_str],
    queryFn: () => getDataBases({ projectId, search_field, search_str }),
    ...config,
  })
}
