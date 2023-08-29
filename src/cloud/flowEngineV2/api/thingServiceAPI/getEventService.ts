import { useQuery } from '@tanstack/react-query'
import { axios } from '~/lib/axios'

import { type ExtractFnReturnType, type QueryConfig } from '~/lib/react-query'
import { type BaseAPIRes } from '~/types'
import { type EventService } from '../../types'

type GetEventServiceRes = {
  data: EventService[]
} & BaseAPIRes

export const getEventService = ({
  thingId,
  serviceName,
  startTime,
  endTime
}: {
  thingId: string
  serviceName: string
  startTime?: number
  endTime?: number
}): Promise<GetEventServiceRes> => {
  return axios.get(`/api/fe/thing/${thingId}/service/${serviceName}/event`, {
    params: {
      offset: 0,
      limit: 100,
      startTime,
      endTime
    },
  })
}

type QueryFnType = typeof getEventService

type UseEventServiceOptions = {
  thingId: string
  serviceName: string
  startTime?: any
  endTime?: any
  config?: QueryConfig<QueryFnType>
}

export const useEventService = ({
  thingId,
  serviceName,
  startTime,
  endTime,
  config,
}: UseEventServiceOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['event-service', thingId, serviceName, startTime, endTime],
    queryFn: () => getEventService({ thingId, serviceName, startTime, endTime }),
    ...config,
  })
}
