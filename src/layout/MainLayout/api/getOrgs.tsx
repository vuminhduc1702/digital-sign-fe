import { useQuery } from '@tanstack/react-query'
import { axios } from '~/lib/axios'

import { type ExtractFnReturnType, type QueryConfig } from '~/lib/react-query'
import { type Org } from '../types'

export const getOrganizations = ({
  projectId,
}: {
  projectId: string
}): Promise<Org[]> => {
  // return axios.get(`/api/organizations/${projectId}`)
  return axios.get('/api/organizations', {
    params: { get_attributes: true, project_id: projectId },
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
