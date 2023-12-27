import { useQuery } from '@tanstack/react-query'
import { axios } from '~/lib/axios'

import { type ExtractFnReturnType, type QueryConfig } from '~/lib/react-query'
import { type inputlist } from './createThingService'

export type GetServiceById = {
  data: {
    name: string
    description: string
    output: string
    input: inputlist[]
    code: string
    fail_limit: number
    lock_time: string
  }
}

export const getThingServiceById = ({
  thingId,
  name,
}: {
  thingId: string
  name?: string
}): Promise<GetServiceById> => {
  return axios.get(`/api/fe/thing/${thingId}/service/${name}`)
}

type QueryFnType = typeof getThingServiceById

type UseThingServiceByIdOptions = {
  thingId: string
  name?: string
  config?: QueryConfig<QueryFnType>
}

export const useThingServiceById = ({
  thingId,
  name,
  config,
}: UseThingServiceByIdOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['serviceById', thingId, name],
    queryFn: () => getThingServiceById({ thingId, name }),
    ...config,
  })
}
