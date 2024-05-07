import { useQuery } from '@tanstack/react-query'
import { axios } from '@/lib/axios'

import { limitPagination } from '@/utils/const'

import { type ExtractFnReturnType, type QueryConfig } from '@/lib/react-query'
import { type EntityType } from '../attrAPI'
import { type GroupList } from '../../types'

type GetGroups = {
  orgId?: string
  projectId: string
  entity_type?: EntityType
  get_attr?: boolean
  offset?: number
  limit?: number
  search_str?: string
  search_field?: string
}

export const getGroups = ({
  projectId,
  orgId,
  entity_type,
  get_attr = false,
  offset,
  limit,
  search_str,
  search_field,
}: GetGroups): Promise<GroupList> => {
  const searchFieldArray = search_field?.split(',')
  const params = new URLSearchParams({
    project_id: projectId,
    org_id: orgId || '',
    entity_type: entity_type || '',
    get_attr: String(get_attr),
    offset: String(offset),
    limit: String(limit),
    search_str: search_str || '',
  })
  searchFieldArray?.forEach(field => {
    params.append('search_field', field)
  })
  return axios.get(`/api/groups`, {
    params,
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
  search_str,
  search_field,
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
      search_str,
      search_field,
    ],
    queryFn: () =>
      getGroups({
        orgId,
        projectId,
        entity_type,
        get_attr,
        offset,
        limit,
        search_str,
        search_field,
      }),
    ...config,
  })
}
