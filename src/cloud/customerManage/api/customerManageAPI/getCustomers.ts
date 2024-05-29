import { useQuery } from '@tanstack/react-query'
import { axios } from '@/lib/axios'

import { type ExtractFnReturnType, type QueryConfig } from '@/lib/react-query'
import { type BasePagination, type BaseAPIRes } from '@/types'
import { type Customer } from '../../types'

type GetCustomers = {
  projectId: string
  search_field?: string
  search_str?: string
}

export type GetCustomertonRes = {
  users: Customer[]
} & BaseAPIRes &
  BasePagination

export const getCustomers = ({
  projectId,
  search_field,
  search_str,
}: GetCustomers): Promise<GetCustomertonRes> => {
  const searchFieldArray = search_field?.split(',')
  const params = new URLSearchParams({
    project_id: projectId,
    search_str: search_str || '',
  })
  searchFieldArray?.forEach(field => {
    params.append('search_field', field)
  })
  return axios.get(`/api/users`, {
    params,
    // : {
    //   project_id: projectId,
    //   search_field,
    //   search_str,
    // },
  })
}

type QueryFnType = typeof getCustomers

type UseEntityCustomertonOptions = {
  config?: QueryConfig<QueryFnType>
} & GetCustomers

export const useGetCustomers = ({
  projectId,
  search_field,
  search_str,
  config,
}: UseEntityCustomertonOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['customers', projectId, search_field, search_str],
    queryFn: () =>
      getCustomers({
        projectId,
        search_field,
        search_str,
      }),
    ...config,
  })
}
