import { useQuery } from '@tanstack/react-query'
import { axios } from '~/lib/axios'

import { limitPagination } from '~/utils/const'

import { type ExtractFnReturnType, type QueryConfig } from '~/lib/react-query'
import { type DeviceList } from '../../types'

export const getDevices = ({
  orgId,
  projectId,
  offset,
  limit,
}: {
  orgId?: string
  projectId: string
  offset?: number
  limit?: number
}): Promise<DeviceList> => {
  return axios.get(`/api/devices`, {
    params: { org_id: orgId, project_id: projectId, offset, limit },
  })
}

type QueryFnType = typeof getDevices

type UseDeviceOptions = {
  orgId?: string
  projectId: string
  offset?: number
  limit?: number
  config?: QueryConfig<QueryFnType>
}

export const useGetDevices = ({
  orgId,
  projectId,
  offset = 0,
  limit = limitPagination,
  config,
}: UseDeviceOptions) => {
  return useQuery<ExtractFnReturnType<QueryFnType>>({
    queryKey: ['devices', orgId, projectId, offset, limit],
    queryFn: () => getDevices({ orgId, projectId, offset, limit }),
    ...config,
  })
}
