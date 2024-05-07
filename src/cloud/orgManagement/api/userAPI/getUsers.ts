import { useQuery } from '@tanstack/react-query'
import { axios } from '@/lib/axios'

import { limitPagination } from '@/utils/const'

import { type ExtractFnReturnType, type QueryConfig } from '@/lib/react-query'
import { type UserInfo } from './getUserInfo'
import { type BasePagination } from '@/types'

export type UserList = {
  users: UserInfo[]
} & BasePagination

type GetUsers = {
  projectId: string
  orgId?: string
  name?: string
  expand?: boolean
  offset?: number
  limit?: number
  search_str?: string
  search_field?: string
}

export const getUsers = ({
  projectId,
  orgId,
  name,
  expand,
  offset,
  limit,
  search_str,
  search_field,
}: GetUsers): Promise<UserList> => {
  const searchFieldArray = search_field?.split(',')
  const params = new URLSearchParams({
    project_id: projectId,
    org_id: orgId || '',
    name: name || '',
    expand: String(expand),
    offset: String(offset),
    limit: String(limit),
    search_str: search_str || '',
  })
  searchFieldArray?.forEach(field => {
    params.append('search_field', field)
  })
  return axios.get(`/api/users`, {
    params,
    // : {
    //   project_id: projectId,xx
    //   org_id: orgId,
    //   name,
    //   expand,
    //   offset,
    //   limit,
    //   search_str,
    //   search_field,
    // },
  })
}

type QueryFnType = typeof getUsers

type UseGetUsersOptions = {
  config?: QueryConfig<QueryFnType>
} & GetUsers

export const useGetUsers = ({
  projectId,
  orgId,
  name,
  expand,
  offset = 0,
  limit = limitPagination,
  search_str,
  search_field,
  config,
}: UseGetUsersOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: [
      'users',
      projectId,
      orgId,
      name,
      expand,
      offset,
      limit,
      search_str,
      search_field,
    ],
    queryFn: () =>
      getUsers({
        projectId,
        orgId,
        name,
        expand,
        offset,
        limit,
        search_str,
        search_field,
      }),
    ...config,
  })
}
