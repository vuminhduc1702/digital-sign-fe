import { useQuery } from '@tanstack/react-query'
import { axios } from '@/lib/axios'

import { type ExtractFnReturnType, type QueryConfig } from '@/lib/react-query'
import { type BasePagination, type BaseAPIRes } from '@/types'
import { type Billing } from '../../types'

type GetBillings = {
  projectId: string
  searchFilter?: string
  searchData?: string
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
  searchData,
  start_time,
  end_time,
}: GetBillings): Promise<GetBillingtonRes> => {
  const params = new URLSearchParams({
    project_id: projectId,
    // start_time: String(start_time),
    // end_time: String(end_time),
  })

  params.set(searchFilter || 'customer_name', searchData || '')

  return axios.get(`/api/priceplan/bill`, {
    params,
    // params: {
    //   project_id: projectId,
    //   start_time,
    //   end_time,
    //   ...searchFilter,
    //   ...searchData,
    // },
  })
}

type QueryFnType = typeof getBillings

type UseEntityBillingtonOptions = {
  config?: QueryConfig<QueryFnType>
} & GetBillings

export const useGetBillings = ({
  projectId,
  searchFilter,
  searchData,
  start_time,
  end_time,
  config,
}: UseEntityBillingtonOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: [
      'billings',
      projectId,
      searchFilter,
      start_time,
      end_time,
      searchData,
    ],
    queryFn: () =>
      getBillings({
        projectId,
        searchFilter,
        start_time,
        end_time,
        searchData,
      }),
    ...config,
  })
}
