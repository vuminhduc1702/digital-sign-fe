import { useQuery } from '@tanstack/react-query'
import { axios } from '@/lib/axios'

import { type ExtractFnReturnType, type QueryConfig } from '@/lib/react-query'
import { type EventList } from '../../types'

type GetEvents = {
  projectId: string
  orgId?: string
  groupId?: string
  search_str?: string
  search_field?: string
}

export const getEvents = ({
  orgId,
  projectId,
  groupId,
  search_str,
  search_field,
}: GetEvents): Promise<EventList> => {
  const searchFieldArray = search_field?.split(',')
  const params = new URLSearchParams({
    project_id: projectId,
    org_id: orgId || '',
    group_id: groupId || '',
    search_str: search_str || '',
  })
  searchFieldArray?.forEach(field => {
    params.append('search_field', field)
  })
  return axios.get(`/api/events`, {
    params,
    // : {
    //   org_id: orgId,
    //   project_id: projectId,
    //   group_id: groupId,
    //   search_str,
    //   search_field,
    // },
  })
}

type QueryFnType = typeof getEvents

type UseEventOptions = {
  config?: QueryConfig<QueryFnType>
} & GetEvents

export const useGetEvents = ({
  projectId,
  orgId,
  groupId,
  search_str,
  search_field,
  config,
}: UseEventOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['events', orgId, projectId, groupId, search_str, search_field],
    queryFn: () =>
      getEvents({ orgId, projectId, groupId, search_str, search_field }),
    ...config,
  })
}
