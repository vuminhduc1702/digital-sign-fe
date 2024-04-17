import { useQuery } from '@tanstack/react-query'
import { axios } from '@/lib/axios'

import { type ExtractFnReturnType, type QueryConfig } from '@/lib/react-query'
import { type EventList } from '../../types'

type GetEvents = {
  projectId: string
  orgId?: string
  groupId?: string
}

export const getEvents = ({
  orgId,
  projectId,
  groupId,
}: GetEvents): Promise<EventList> => {
  return axios.get(`/api/events`, {
    params: {
      org_id: orgId,
      project_id: projectId,
      group_id: groupId,
    },
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
  config,
}: UseEventOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['events', orgId, projectId, groupId],
    queryFn: () => getEvents({ orgId, projectId, groupId }),
    ...config,
  })
}
