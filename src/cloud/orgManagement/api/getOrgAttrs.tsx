import { useQuery } from '@tanstack/react-query'

import { axios } from '~/lib/axios'

import { type Org } from '~/layout/MainLayout/types'
import { type ExtractFnReturnType, type QueryConfig } from '~/lib/react-query'

export const getOrgAttrs = ({ orgId }: { orgId: string }): Promise<Org> => {
  return axios.get(`/api/organizations/${orgId}`)
}

type QueryFnType = typeof getOrgAttrs

type UseOrgAttrsOptions = {
  orgId: string
  config?: QueryConfig<QueryFnType>
}

export const useOrgAttrs = ({ orgId, config }: UseOrgAttrsOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    ...config,
    queryKey: ['orgAttrs', orgId],
    queryFn: () => getOrgAttrs({ orgId }),
  })
}
