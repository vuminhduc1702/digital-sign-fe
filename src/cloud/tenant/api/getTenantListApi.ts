import { limitPagination } from './../../../utils/const'
import { useQuery } from '@tanstack/react-query'
import { axios } from '@/lib/axios'
import { type ExtractFnReturnType, type QueryConfig } from '@/lib/react-query'

type CustomerList = {
  limit?: number
  offset?: number
  search_field?: string
  search_str?: string
}

export const getCustomerList = ({
  limit,
  offset,
  search_field,
  search_str,
}: CustomerList): Promise<any> => {
  const searchFieldArray = search_field?.split(',')
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
    search_str: search_str || '',
  })
  searchFieldArray?.forEach(field => {
    params.append('search_field', field)
  })
  return axios.get(`/api/tenant`, {
    params,
    // : {
    //   limit,
    //   offset,
    //   search_field,
    //   search_str,
    // },
  })
  // if (search_str) {
  //   return axios.get(
  //     `/api/tenant?limit=${limit}&offset=${offset}&search_field=${search_field}&search_str=${search_str}`,
  //   )
  // }
  // return axios.get(`/api/tenant?limit=${limit}&offset=${offset}`)
}

type CustomerListQueryFnType = typeof getCustomerList

type UseCustomerList = {
  config?: QueryConfig<CustomerListQueryFnType>
} & CustomerList

export const useCustomerList = ({
  limit = limitPagination,
  offset = 0,
  search_str,
  search_field,
  config,
}: UseCustomerList) => {
  return useQuery<ExtractFnReturnType<CustomerListQueryFnType>>({
    queryKey: [
      'call-customer-list-api',
      limit,
      offset,
      search_str,
      search_field,
    ],
    queryFn: () => getCustomerList({ limit, offset, search_str, search_field }),
    ...config,
  })
}
