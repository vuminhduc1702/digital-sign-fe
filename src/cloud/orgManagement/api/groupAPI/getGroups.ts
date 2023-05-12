import { useQuery } from '@tanstack/react-query'
import { axios } from '~/lib/axios'

import { limitPagination } from '~/utils/const'

import { type ExtractFnReturnType, type QueryConfig } from '~/lib/react-query'
import { type EntityType } from '../attrAPI'
import { type GroupList } from '../../types'

type GetGroups = {
  orgId?: string
  projectId: string
  entity_type?: EntityType
  get_attr?: boolean
  offset?: number
  limit?: number
}

export const getGroups = ({
  projectId,
  orgId,
  entity_type,
  get_attr = false,
  offset,
  limit,
}: GetGroups): Promise<GroupList> => {
  return axios.get(`/api/groups`, {
    params: {
      project_id: projectId,
      org_id: orgId,
      entity_type,
      get_attr,
      offset,
      limit,
    },
  })
}

type QueryFnType = typeof getGroups

type UseGroupOptions = {
  config?: QueryConfig<QueryFnType>
} & GetGroups

export const useGetGroups = ({
  orgId,
  projectId,
  entity_type,
  get_attr = false,
  offset = 0,
  limit = limitPagination,
  config,
}: UseGroupOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: [
      'groups',
      orgId,
      projectId,
      offset,
      limit,
      entity_type,
      get_attr,
    ],
    queryFn: () =>
      getGroups({ orgId, projectId, entity_type, get_attr, offset, limit }),
    ...config,
  })
}
