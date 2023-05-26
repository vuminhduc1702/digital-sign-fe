import { useQuery } from '@tanstack/react-query'
import { axios } from '~/lib/axios'

import { limitPagination } from '~/utils/const'

import { type ExtractFnReturnType, type QueryConfig } from '~/lib/react-query'
import { type RoleList } from '../types'

type GetRoles = {
  projectId: string
  offset?: number
  limit?: number
}

export const getRoles = ({
  projectId,
  offset,
  limit,
}: GetRoles): Promise<RoleList> => {
  return axios.get(`/api/roles`, {
    params: {
      project_id: projectId,
      offset,
      limit,
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
}: UseRoleOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['roles', projectId, offset, limit],
    queryFn: () => getRoles({ projectId, offset, limit }),
    ...config,
  })
}
