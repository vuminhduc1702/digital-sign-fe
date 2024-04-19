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
}

export const getUsers = ({
  projectId,
  orgId,
  name,
  expand,
  offset,
  limit,
}: GetUsers): Promise<UserList> => {
  return axios.get(`/api/users`, {
    params: {
      project_id: projectId,
      org_id: orgId,
      name,
      expand,
      offset,
      limit,
    },
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
  config,
}: UseGetUsersOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['users', projectId, orgId, name, expand, offset, limit],
    queryFn: () => getUsers({ projectId, orgId, name, expand, offset, limit }),
    ...config,
  })
}
