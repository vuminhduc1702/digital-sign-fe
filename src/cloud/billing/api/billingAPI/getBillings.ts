import { useQuery } from '@tanstack/react-query'
import { axios } from '~/lib/axios'

import { type ExtractFnReturnType, type QueryConfig } from '~/lib/react-query'
import { type BasePagination, type BaseAPIRes } from '~/types'
import { type Billing } from '../../types'

export interface SearchFilter {
  [key: string]: string
}

type GetBillings = {
  projectId: string
  searchFilter?: SearchFilter
  start_time?: number
  end_time?: number
}

export type GetBillingtonRes = {
  data: {
    data: Billing[]
  } & BasePagination
} & BaseAPIRes

export const getBillings = ({
  projectId,
  searchFilter,
  start_time,
  end_time
}: GetBillings): Promise<GetBillingtonRes> => {
  return axios.get(`/api/priceplan/bill`, {
    params: {
      project_id: projectId,
      start_time,
      end_time,
      ...searchFilter,
    },
  })
}

type QueryFnType = typeof getBillings

type UseEntityBillingtonOptions = {
  config?: QueryConfig<QueryFnType>
} & GetBillings

export const useGetBillings = ({
  projectId,
  searchFilter,
  start_time,
  end_time,
  config,
}: UseEntityBillingtonOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['billings', projectId, searchFilter, start_time, end_time],
    queryFn: () =>
      getBillings({ projectId, searchFilter, start_time, end_time }),
    ...config,
  })
}
