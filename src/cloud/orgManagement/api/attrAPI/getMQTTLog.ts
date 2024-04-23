import { useQuery } from '@tanstack/react-query'

import { axios } from '@/lib/axios'
import { limitPagination } from '@/utils/const'

import { type ExtractFnReturnType, type QueryConfig } from '@/lib/react-query'

type GetMQTTLog = {
  project_id: string
  device_id: string
  limit?: number
  startTime?: number
  endTime?: number
  before?: string
  after?: string
}

export type MQTTMessage = {
  project_id: string
  created_by: string
  owner: string
  topic: string
  device_id: string
  payload_as_string: string
  ts: number
}

type MQTTLog = {
  limit: number
  before: string
  after: string
  messages: MQTTMessage[]
}

export const getMQTTLog = ({
  startTime,
  endTime,
  project_id,
  device_id,
  before,
  after,
  limit = limitPagination,
}: GetMQTTLog): Promise<MQTTLog> => {
  return axios.get(`/api/overviews/messageBroker`, {
    params: { limit, startTime, endTime, project_id, device_id, before, after },
  })
}

type QueryFnType = typeof getMQTTLog

type UseMQTTLogOptions = {
  config?: QueryConfig<QueryFnType>
} & GetMQTTLog

export const useMQTTLog = ({
  limit = limitPagination,
  startTime,
  endTime,
  project_id,
  device_id,
  before,
  after,
  config,
}: UseMQTTLogOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: [
      'MQTTLog',
      startTime,
      endTime,
      project_id,
      device_id,
      before,
      after,
      limit,
    ],
    queryFn: () =>
      getMQTTLog({
        startTime,
        endTime,
        project_id,
        device_id,
        before,
        after,
        limit,
      }),
    ...config,
  })
}
