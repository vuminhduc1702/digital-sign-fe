import { useQuery } from '@tanstack/react-query'
import { axios } from '~/lib/axios'

import { limitPagination } from '~/utils/const'

import { type ExtractFnReturnType, type QueryConfig } from '~/lib/react-query'
import { type RoleList } from '../types'

type GetRoles = {
  projectId: string
  offset?: number
  limit?: number
  isHasApplicableTo?: boolean
}

export const getRoles = ({
  projectId,
  offset,
  limit,
  isHasApplicableTo,
}: GetRoles): Promise<RoleList> => {
  const params = {
    project_id: projectId,
    offset,
    limit,
  }

  if (isHasApplicableTo) {
    params.applicable_to = 'TENANT_DEV'
  }

  return axios.get(`/api/roles`, {
    params,
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
  isHasApplicableTo = false,
}: UseRoleOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['roles', projectId, offset, limit, isHasApplicableTo],
    queryFn: () => getRoles({ projectId, offset, limit, isHasApplicableTo }),
    enabled: !!projectId,
    ...config,
  })
}
