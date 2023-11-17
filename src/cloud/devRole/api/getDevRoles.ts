import { useQuery } from '@tanstack/react-query'
import { axios } from '~/lib/axios'

import { limitPagination } from '~/utils/const'

import { type ExtractFnReturnType, type QueryConfig } from '~/lib/react-query'
import { type RoleList } from '../types'

type GetDevRoles = {
  projectId: string
  offset?: number
  limit?: number
}

export const getDevRoles = ({
  projectId,
  offset,
  limit,
}: GetDevRoles): Promise<RoleList> => {
  return axios.get(`/api/roles`, {
    params: {
      project_id: projectId,
      offset,
      limit,
      applicable_to: 'TENANT_DEV',
    },
  })
}

type QueryFnType = typeof getDevRoles

type UseDevRoleOptions = {
  config?: QueryConfig<QueryFnType>
} & GetDevRoles

export const useDevGetRoles = ({
  projectId,
  offset = 0,
  limit = limitPagination,
  config,
}: UseDevRoleOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['dev-role', projectId, offset, limit],
    queryFn: () => getDevRoles({ projectId, offset, limit }),
    enabled: !!projectId,
    ...config,
  })
}
