import { useQuery } from '@tanstack/react-query'

import { axios } from '~/lib/axios'

import { type ExtractFnReturnType, type QueryConfig } from '~/lib/react-query'
import { type Role } from '../types'

export const getDevRoleById = ({
  roleId,
}: {
  roleId: string
}): Promise<Role> => {
  return axios.get(`/api/roles/${roleId}`)
}

type QueryFnType = typeof getDevRoleById

type UseDevRoleByIdOptions = {
  roleId: string
  config?: QueryConfig<QueryFnType>
}

export const useDevRoleById = ({ roleId, config }: UseDevRoleByIdOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['dev-role', roleId],
    queryFn: () => getDevRoleById({ roleId }),
    enabled: !!roleId,
    ...config,
  })
}
