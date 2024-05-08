import { useQuery } from '@tanstack/react-query'
import { axios } from '@/lib/axios'

import { type ExtractFnReturnType, type QueryConfig } from '@/lib/react-query'
import { type BasePagination, type BaseAPIRes } from '@/types'
import { type Subcription } from '../../types'

export interface searchFilter {
  [key: string]: string
}

type GetSubcriptons = {
  projectId: string
  search_field?: string
  search_str?: string
  searchData?: searchFilter
}

export type GetSubcriptonRes = {
  data: {
    data: Subcription[]
  } & BasePagination
} & BaseAPIRes

export const getSubcriptons = ({
  projectId,
  search_field,
  search_str,
  searchData,
}: GetSubcriptons): Promise<GetSubcriptonRes> => {
  const searchFieldArray = search_field?.split(',')
  const params = new URLSearchParams({
    project_id: projectId,
    search_str: search_str || '',
    searchData: JSON.stringify(searchData),
  })
  searchFieldArray?.forEach(field => {
    params.append('search_field', field)
  })
  return axios.get(`/api/priceplan/subscriptions`, {
    params,
    // : {
    //   project_id: projectId,
    //   search_field,
    //   search_str,
    //   ...searchData,
    // },
  })
}

type QueryFnType = typeof getSubcriptons

type UseEntitySubcriptonOptions = {
  config?: QueryConfig<QueryFnType>
} & GetSubcriptons

export const useGetSubcriptons = ({
  projectId,
  search_field,
  search_str,
  searchData,
  config,
}: UseEntitySubcriptonOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['subcriptions', projectId, search_field, search_str, searchData],
    queryFn: () =>
      getSubcriptons({ projectId, search_field, search_str, searchData }),
    ...config,
  })
}
