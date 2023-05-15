import { useQuery } from '@tanstack/react-query'
import { axios } from '~/lib/axios'

import { type ExtractFnReturnType, type QueryConfig } from '~/lib/react-query'
import { type OrgList } from '../types'

type GetOrgs = {
  projectId: string
  get_attributes?: boolean
}

export const getOrgs = ({
  projectId,
  get_attributes,
}: GetOrgs): Promise<OrgList> => {
  return axios.get('/api/organizations/expand', {
    params: { project_id: projectId, get_attributes },
  })
}

type QueryFnType = typeof getOrgs

type UseGetOrgsOptions = {
  config?: QueryConfig<QueryFnType>
} & GetOrgs

export const useGetOrgs = ({
  projectId,
  get_attributes = false,
  config,
}: UseGetOrgsOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['orgs', projectId, get_attributes],
    queryFn: () => getOrgs({ projectId, get_attributes }),
    ...config,
  })
}
