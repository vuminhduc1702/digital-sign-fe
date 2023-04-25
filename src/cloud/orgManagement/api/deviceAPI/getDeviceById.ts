import { useQuery } from '@tanstack/react-query'
import { axios } from '~/lib/axios'

import { type ExtractFnReturnType, type QueryConfig } from '~/lib/react-query'
import { type Device } from '../../types'

export const getDeviceById = ({
  deviceId,
}: {
  deviceId: string
}): Promise<Device> => {
  return axios.get(`/api/devices/${deviceId}`)
}

type QueryFnType = typeof getDeviceById

type UseDeviceByIdOptions = {
  deviceId: string
  config?: QueryConfig<QueryFnType>
}

export const useGetDeviceById = ({
  deviceId,
  config,
}: UseDeviceByIdOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['device', deviceId],
    queryFn: () => getDeviceById({ deviceId }),
    ...config,
  })
}
