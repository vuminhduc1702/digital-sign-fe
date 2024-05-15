import { useQuery } from '@tanstack/react-query'
import { axios } from '@/lib/axios'

import { type ExtractFnReturnType, type QueryConfig } from '@/lib/react-query'

import { type BaseAPIRes } from '@/types'
import { type ThingService } from '@/cloud/flowEngineV2'
import { limitPagination } from '@/utils/const'

type GetServiceThings = {
  thingId: string
  offset?: number
  limit?: number
  search_str?: string
  search_field?: string
}

type GetServiceThingsRes = {
  data: ThingService[]
} & BaseAPIRes

export const getServiceThings = ({
  thingId,
  search_str,
  search_field,
}: GetServiceThings): Promise<GetServiceThingsRes> => {
  return axios.get(`/api/fe/thing/${thingId}/service`, {
    params: {
      // share: true,
      search_str: search_str,
      search_field: search_field,
    },
  })
}

type QueryFnType = typeof getServiceThings

type UseServiceThingsOptions = {
  config?: QueryConfig<QueryFnType>
} & GetServiceThings

export const useGetServiceThings = ({
  thingId,
  search_str,
  search_field,
  config,
}: UseServiceThingsOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['service-things', thingId, search_str, search_field],
    queryFn: () => getServiceThings({ thingId, search_str, search_field }),
    ...config,
  })
}
