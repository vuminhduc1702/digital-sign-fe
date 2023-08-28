import { useQuery } from '@tanstack/react-query'
import { axios } from '~/lib/axios'

import { type ExtractFnReturnType, type QueryConfig } from '~/lib/react-query'

import { type BaseAPIRes } from '~/types'
import { type ThingService } from '~/cloud/flowEngineV2'

type GetEventService = {
  thingId: string
  offset: number
  limit: number
  endTime: number
  startTime: number
  service_name: string
}

type GetEventServiceRes = {
  data: ThingService[]
} & BaseAPIRes

export const getEventService = ({
  thingId,
  offset,
  limit,
  endTime,
  startTime,
  service_name,
}: GetEventService): Promise<GetEventServiceRes> => {
  return axios.get(`/api/fe/thing/${thingId}/service/${service_name}/event`, {
    params: {
      offset,
      limit,
      endTime,
      startTime,
    },
  })
}

type QueryFnType = typeof getEventService

type UseServiceThingsOptions = {
  config?: QueryConfig<QueryFnType>
} & GetEventService

export const useGetEventService = ({
  thingId,
  offset,
  limit,
  endTime,
  startTime,
  service_name,
  config,
}: UseServiceThingsOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: [
      'event-service',
      thingId,
      offset,
      limit,
      endTime,
      startTime,
      service_name,
    ],
    queryFn: () =>
      getEventService({
        thingId,
        offset,
        limit,
        endTime,
        startTime,
        service_name,
      }),
    ...config,
  })
}
