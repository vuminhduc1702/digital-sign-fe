import { useQuery } from '@tanstack/react-query'
import { axios } from '~/lib/axios'

import { type ExtractFnReturnType, type QueryConfig } from '~/lib/react-query'

import { type BaseAPIRes } from '~/types'
import { type ThingService } from '~/cloud/flowEngineV2'

type GetServiceThings = {
  thingId: string
}

type GetServiceThingsRes = {
  data: ThingService[]
} & BaseAPIRes

export const getServiceThings = ({
  thingId,
}: GetServiceThings): Promise<GetServiceThingsRes> => {
  return axios.get(`/api/fe/thing/${thingId}/service`)
}

type QueryFnType = typeof getServiceThings

type UseServiceThingsOptions = {
  config?: QueryConfig<QueryFnType>
} & GetServiceThings

export const useGetServiceThings = ({
  thingId,
  config,
}: UseServiceThingsOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['service-things', thingId],
    queryFn: () => getServiceThings({ thingId }),
    ...config,
  })
}
