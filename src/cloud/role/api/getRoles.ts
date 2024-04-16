import { useQuery } from '@tanstack/react-query'
import { axios } from '~/lib/axios'

import { limitPagination } from '~/utils/const'

import { type ExtractFnReturnType, type QueryConfig } from '~/lib/react-query'
import { type RoleList } from '../types'
import { type RoleTypes } from '~/lib/authorization'

type GetRoles = {
  projectId: string
  offset?: number
  limit?: number
  applicable_to?: RoleTypes
}

export const getRoles = ({
  projectId,
  offset,
  limit,
  applicable_to,
}: GetRoles): Promise<RoleList> => {
  return axios.get(`/api/roles`, {
    params: {
      project_id: projectId,
      offset,
      limit,
      applicable_to,
    },
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
}: UseRoleOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['roles', projectId, offset, limit, applicable_to],
    queryFn: () => getRoles({ projectId, offset, limit, applicable_to }),
    enabled: !!projectId,
    ...config,
  })
}
