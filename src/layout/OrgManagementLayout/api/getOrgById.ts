import { useQuery } from '@tanstack/react-query'

import { axios } from '~/lib/axios'

import { type Org } from '~/layout/MainLayout/types'
import { type ExtractFnReturnType, type QueryConfig } from '~/lib/react-query'

export const getOrgById = ({
  orgId,
  get_attributes,
}: {
  orgId: string
  get_attributes: boolean
}): Promise<Org> => {
  return axios.get(`/api/organizations/${orgId}`, {
    params: { get_attributes },
  })
}

type QueryFnType = typeof getOrgById

type UseOrgByIdOptions = {
  orgId: string
  config?: QueryConfig<QueryFnType>
}

export const useOrgById = ({ orgId, config }: UseOrgByIdOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['orgs', orgId],
    queryFn: () => getOrgById({ orgId, get_attributes: false }),
    enabled: !!orgId,
    ...config,
  })
}
