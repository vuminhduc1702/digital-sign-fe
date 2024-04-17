import { useQuery } from '@tanstack/react-query'
import { axios } from '@/lib/axios'
import { type ExtractFnReturnType, type QueryConfig } from '@/lib/react-query'

export const getCustomerList = ({
  limit,
  offset,
  search_field,
  search_str,
}: {
  limit: number
  offset: number
  search_field: string
  search_str: string
}): Promise<any> => {
  if (search_str) {
    return axios.get(
      `/api/tenant?limit=${limit}&offset=${offset}&${search_field}=${search_str}`,
    )
  }
  return axios.get(`/api/tenant?limit=${limit}&offset=${offset}`)
}

type CustomerListQueryFnType = typeof getCustomerList

type UseCustomerList = {
  data: {
    limit: number
    offset: number
    search_field: string
    search_str: string
  }
  config?: QueryConfig<CustomerListQueryFnType>
}

export const useCustomerList = ({ config, data }: UseCustomerList) => {
  return useQuery<ExtractFnReturnType<CustomerListQueryFnType>>({
    queryKey: ['call-customer-list-api', { ...data }],
    queryFn: () => getCustomerList({ ...data }),
    ...config,
  })
}
