import { useQuery } from '@tanstack/react-query'
import { axios } from '~/lib/axios'

import { type ExtractFnReturnType, type QueryConfig } from '~/lib/react-query'
import { type OrgList } from '../types'

export const getOrgs = ({
  projectId,
  offset = 0,
  limit = 100,
}: {
  projectId: string
  offset?: number
  limit?: number
}): Promise<OrgList> => {
  return axios.get('/api/organizations/expand', {
    params: { project_id: projectId, offset, limit },
  })
}

type QueryFnType = typeof getOrgs

type UseGetOrgsOptions = {
  projectId: string
  config?: QueryConfig<QueryFnType>
}

export const useGetOrgs = ({ projectId, config }: UseGetOrgsOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['orgs', projectId],
    queryFn: () => getOrgs({ projectId }),
    ...config,
  })
}
