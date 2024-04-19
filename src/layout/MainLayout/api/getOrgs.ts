import { useQuery } from '@tanstack/react-query'
import { axios } from '@/lib/axios'

import { type ExtractFnReturnType, type QueryConfig } from '@/lib/react-query'
import { type OrgList } from '../types'

type GetOrgs = {
  projectId: string
  orgId?: string
  get_attributes?: boolean
  level?: number
}

export const getOrgs = ({
  projectId,
  orgId,
  get_attributes,
  level,
}: GetOrgs): Promise<OrgList> => {
  return axios.get('/api/organizations/expand', {
    params: { project_id: projectId, org_id: orgId, get_attributes, level },
  })
}

type QueryFnType = typeof getOrgs

type UseGetOrgsOptions = {
  config?: QueryConfig<QueryFnType>
} & GetOrgs

export const useGetOrgs = ({
  projectId,
  orgId,
  get_attributes = false,
  config,
  level,
}: UseGetOrgsOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['orgs', projectId, orgId, get_attributes, level],
    queryFn: () => getOrgs({ projectId, orgId, get_attributes, level }),
    ...config,
  })
}
