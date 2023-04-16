import { useQuery } from '@tanstack/react-query'

import { axios } from '~/lib/axios'

import { type Org } from '~/layout/MainLayout/types'
import { type ExtractFnReturnType, type QueryConfig } from '~/lib/react-query'

export const getOrgById = ({ orgId }: { orgId: string }): Promise<Org> => {
  return axios.get(`/api/organizations/${orgId}`)
}

type QueryFnType = typeof getOrgById

type UseOrgByIdOptions = {
  orgId: string
  config?: QueryConfig<QueryFnType>
}

export const useOrgById = ({ orgId, config }: UseOrgByIdOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['orgById', orgId],
    queryFn: () => getOrgById({ orgId }),
    enabled: !!orgId,
    ...config,
  })
}
