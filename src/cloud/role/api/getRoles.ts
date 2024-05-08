import { useQuery } from '@tanstack/react-query'
import { axios } from '@/lib/axios'

import { limitPagination } from '@/utils/const'

import { type ExtractFnReturnType, type QueryConfig } from '@/lib/react-query'
import { type RoleList } from '../types'
import { type RoleTypes } from '@/lib/authorization'

type GetRoles = {
  projectId: string
  offset?: number
  limit?: number
  applicable_to?: RoleTypes
  search_str?: string
  search_field?: string
}

export const getRoles = ({
  projectId,
  offset,
  limit,
  applicable_to,
  search_str,
  search_field,
}: GetRoles): Promise<RoleList> => {
  const searchFieldArray = search_field?.split(',')
  const params = new URLSearchParams({
    project_id: projectId,
    offset: String(offset),
    limit: String(limit),
    applicable_to: applicable_to || '',
    search_str: search_str || '',
  })
  searchFieldArray?.forEach(field => {
    params.append('search_field', field)
  })
  return axios.get(`/api/roles`, {
    params,
    // : {
    //   project_id: projectId,
    //   offset,
    //   limit,
    //   applicable_to,
    //   search_str,
    //   search_field,
    // },
  })
}

type QueryFnType = typeof getRoles

type UseRoleOptions = {
  config?: QueryConfig<QueryFnType>
} & GetRoles

export const useGetRoles = ({
  projectId,
  offset = 0,
  limit = limitPagination,
  config,
  applicable_to,
  search_str,
  search_field,
}: UseRoleOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: [
      'roles',
      projectId,
      offset,
      limit,
      applicable_to,
      search_str,
      search_field,
    ],
    queryFn: () =>
      getRoles({
        projectId,
        offset,
        limit,
        applicable_to,
        search_str,
        search_field,
      }),
    enabled: !!projectId,
    ...config,
  })
}
