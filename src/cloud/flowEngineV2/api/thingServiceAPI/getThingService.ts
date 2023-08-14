import { useQuery } from '@tanstack/react-query'
import { axios } from '~/lib/axios'

import { type ExtractFnReturnType, type QueryConfig } from '~/lib/react-query'

import { type ThingService } from '../../types'
import { type BaseAPIRes } from '~/types'

type GetThingServices = {
  thingId: string
}

export type GetThingServicesRes = {
  data: ThingService[]
} & BaseAPIRes

export const getThingServices = ({
  thingId
}: GetThingServices): Promise<GetThingServicesRes> => {
  return axios.get(`/api/fe/thing/${thingId}/service`)
}

type QueryFnType = typeof getThingServices

type UseThingServicesOptions = {
  config?: QueryConfig<QueryFnType>
} & GetThingServices

export const useGetThingServices = ({
  thingId,
  config,
}: UseThingServicesOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['entity-thingservices', thingId],
    queryFn: () => getThingServices({ thingId }),
    ...config,
  })
}

