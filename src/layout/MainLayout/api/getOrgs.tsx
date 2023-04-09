import { useQuery } from '@tanstack/react-query'
import { axios } from '~/lib/axios'

import { type ExtractFnReturnType, type QueryConfig } from '~/lib/react-query'
import { type OrgList } from '../types'

export const getOrganizations = ({
  projectId,
  offset,
  limit,
}: {
  projectId: string
  offset?: number
  limit?: number
}): Promise<OrgList> => {
  return axios.get('/api/organizations/expand', {
    params: { project_id: projectId, offset, limit },
  })
}

type QueryFnType = typeof getOrganizations

type UseOrganizationsOptions = {
  projectId: string
  config?: QueryConfig<QueryFnType>
}

export const useOrganizations = ({
  projectId,
  config,
}: UseOrganizationsOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    ...config,
    queryKey: ['orgs', projectId],
    queryFn: () => getOrganizations({ projectId }),
  })
}
