import { useQuery } from '@tanstack/react-query'
import { axios } from '~/lib/axios'

import { type ExtractFnReturnType, type QueryConfig } from '~/lib/react-query'
import { type DeviceList } from '../../types'

export const getDevice = ({
  orgId,
  projectId,
  expand = true,
}: {
  orgId: string
  projectId: string
  expand?: boolean
}): Promise<DeviceList> => {
  return axios.get(`/api/devices/organization/${orgId}`, {
    params: { project_id: projectId, expand },
  })
}

type QueryFnType = typeof getDevice

type UseDeviceOptions = {
  orgId: string
  projectId: string
  config?: QueryConfig<QueryFnType>
}

export const useGetDevice = ({
  orgId,
  projectId,
  config,
}: UseDeviceOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['devices', orgId, projectId],
    queryFn: () => getDevice({ orgId, projectId }),
    ...config,
  })
}
