import { useQuery } from '@tanstack/react-query'
import { axios } from '~/lib/axios'

import { type ExtractFnReturnType, type QueryConfig } from '~/lib/react-query'
import { type Device } from '../../types'

export const getDeviceById = ({
  deviceId,
  get_attributes,
}: {
  deviceId: string
  get_attributes?: boolean
}): Promise<Device> => {
  return axios.get(`/api/devices/${deviceId}`, {
    params: { get_attributes },
  })
}

type QueryFnType = typeof getDeviceById

type UseDeviceByIdOptions = {
  deviceId: string
  get_attributes?: boolean
  config?: QueryConfig<QueryFnType>
}

export const useDeviceById = ({
  deviceId,
  get_attributes = false,
  config,
}: UseDeviceByIdOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['deviceById', deviceId, get_attributes],
    queryFn: () => getDeviceById({ deviceId, get_attributes }),
    ...config,
  })
}
