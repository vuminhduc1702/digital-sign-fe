import { useQuery } from '@tanstack/react-query'
import { axios } from '~/lib/axios'

import { type ExtractFnReturnType, type QueryConfig } from '~/lib/react-query'

import { type Service } from '../../types'
import { type BaseAPIRes } from '~/types'

type GetServiceThings = {
  thingId: string
}

type GetServiceThingsRes = {
  data: Service
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
