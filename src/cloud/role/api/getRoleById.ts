import { useQuery } from '@tanstack/react-query'

import { axios } from '~/lib/axios'

import { type ExtractFnReturnType, type QueryConfig } from '~/lib/react-query'
import { type Role } from '../types'

export const getRoleById = ({ roleId }: { roleId: string }): Promise<Role> => {
  return axios.get(`/api/roles/${roleId}`)
}

type QueryFnType = typeof getRoleById

type UseRoleByIdOptions = {
  roleId: string
  config?: QueryConfig<QueryFnType>
}

export const useRoleById = ({ roleId, config }: UseRoleByIdOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['roles', roleId],
    queryFn: () => getRoleById({ roleId }),
    enabled: !!roleId,
    ...config,
  })
}
